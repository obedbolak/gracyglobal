// app/api/courses/[id]/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/quiz?lessonId= — get quiz for a lesson
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // Never expose the answer to the client
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get user's previous attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: quiz.id,
        userId: session.user.id,
      },
      orderBy: { attemptedAt: "desc" },
    });

    return NextResponse.json({ quiz, attempts });
  } catch (error) {
    console.error("[GET /api/courses/[id]/quiz]", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/quiz — submit quiz answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, answers } = await req.json();
    // answers: number[] — array of selected option indexes, matching question order

    if (!lessonId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "lessonId and answers are required" },
        { status: 400 },
      );
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    // Get quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade the quiz
    let correct = 0;
    const results = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.answer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        question: q.question,
        selectedAnswer: answers[index],
        correctAnswer: q.answer,
        isCorrect,
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
        answers,
        score,
        passed,
      },
    });

    // If passed, mark lesson as complete
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      attempt,
      score,
      passed,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (error) {
    console.error("[POST /api/courses/[id]/quiz]", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 },
    );
  }
}
