// app/api/learn/[id]/lesson/[lessonId]/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const { id: courseId, lessonId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await req.json(); // number[]

    // Fetch the quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade each question
    const results = quiz.questions.map((question, idx) => {
      const selectedAnswer = answers[idx] ?? -1;
      const isCorrect = selectedAnswer === question.answer;
      return {
        questionId: question.id,
        isCorrect,
        correctAnswer: question.answer,
        selectedAnswer,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save attempt
    await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
        answers: answers,
        score,
        passed,
      },
    });

    // If passed, mark the lesson as complete
    if (passed) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId },
        },
      });

      if (enrollment) {
        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId,
            },
          },
          update: { completed: true, completedAt: new Date() },
          create: {
            enrollmentId: enrollment.id,
            lessonId,
            completed: true,
            completedAt: new Date(),
          },
        });
      }
    }

    // ✅ Return the exact shape the page expects
    return NextResponse.json({
      score,
      passed,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (e: any) {
    console.error("[POST quiz]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
