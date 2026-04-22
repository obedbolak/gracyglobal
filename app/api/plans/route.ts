// app/api/plans/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// app/api/plans/route.ts — updated GET
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const planCode = searchParams.get("planCode");

    // If planCode param present → return specific plan details (no auth needed)
    if (planCode) {
      const plan = await prisma.pricingPlan.findUnique({
        where: {
          planCode: planCode.toUpperCase(),
          active: true,
        },
      });

      if (!plan) {
        return NextResponse.json(
          {
            success: false,
            error: "Plan not found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: plan,
      });
    }

    // If category param present → return public plans for that category (no auth needed)
    if (category) {
      const plans = await prisma.pricingPlan.findMany({
        where: {
          active: true,
          category: category as any,
        },
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: { plans, subscription: null },
      });
    }

    // Otherwise → return user's subscriptions (existing auth-gated logic)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return all plans + all active or pending subscriptions (for sidebars to filter by category)
    const [allPlans, allSubscriptions] = await Promise.all([
      prisma.pricingPlan.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.userSubscription.findMany({
        where: {
          userId: user.id,
          status: {
            in: ["ACTIVE", "TRIALING"], // Include TRIALING (pending payment) subscriptions
          },
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // For backwards compatibility, also return the first subscription
    const activeSubscription = allSubscriptions[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        plans: allPlans,
        subscription: activeSubscription,
        subscriptions: allSubscriptions,
      },
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get plans" },
      { status: 500 },
    );
  }
}
// POST - Create subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { planCode, paymentMethod, paymentReference } = body;

    if (!planCode) {
      return NextResponse.json(
        { success: false, error: "Plan code is required" },
        { status: 400 },
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Get plan
    const plan = await prisma.pricingPlan.findUnique({
      where: { planCode: planCode.toUpperCase() },
    });

    if (!plan || !plan.active) {
      return NextResponse.json(
        { success: false, error: "Invalid plan" },
        { status: 404 },
      );
    }

    // Check if user already has this subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId_planId: {
          userId: user.id,
          planId: plan.id,
        },
      },
    });

    // For free plans, allow re-subscription if not active (maybe previous attempt failed)
    // For paid plans, don't allow if already active
    if (existingSubscription && existingSubscription.status === "ACTIVE") {
      if (plan.price === 0) {
        // For free plans, return success if already active
        return NextResponse.json({
          success: true,
          data: { subscription: existingSubscription, payment: null },
          message: "Subscription is already active!",
        });
      } else {
        return NextResponse.json(
          { success: false, error: "You already have this subscription" },
          { status: 400 },
        );
      }
    }

    // Calculate period end based on interval
    const now = new Date();
    let periodEnd = new Date(now);

    switch (plan.interval) {
      case "MONTHLY":
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case "YEARLY":
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
      case "ONGOING":
      case "PER_LEAD":
      case "PER_USE":
        // For free/usage-based plans, set far future date
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);
        break;
      default:
        periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create subscription and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update subscription
      const subscription = await tx.userSubscription.upsert({
        where: {
          userId_planId: {
            userId: user.id,
            planId: plan.id,
          },
        },
        create: {
          userId: user.id,
          planId: plan.id,
          status: plan.price === 0 ? "ACTIVE" : "TRIALING", // Free plans are immediately active
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          sessionsUsed: 0,
          leadsUsed: 0,
          productsUsed: 0,
          coursesUsed: 0,
        },
        update: {
          status: plan.price === 0 ? "ACTIVE" : "TRIALING",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
        include: {
          plan: true,
        },
      });

      // Create payment record if plan is not free
      let payment = null;
      if (plan.price > 0) {
        payment = await tx.payment.create({
          data: {
            userId: user.id,
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: "XAF",
            method: paymentMethod || "MOBILE_MONEY_MTN",
            reference: paymentReference || null,
            status: "PENDING",
            description: `Subscription to ${plan.name} plan (${plan.category})`,
            metadata: {
              planCode: plan.planCode,
              planName: plan.name,
              category: plan.category,
            },
          },
        });
      }

      // Add role based on category if not already present
      let roleToAdd: string | null = null;
      switch (plan.category) {
        case "COUNSELLOR":
          roleToAdd = "COUNSELOR";
          break;
        case "TEACHER":
          roleToAdd = "TEACHER";
          break;
        case "MARKETPLACE":
          roleToAdd = "MARKETPLACE"; // ← separate from SERVICE/CREATOR
          break;
        case "SERVICE":
          roleToAdd = "CREATOR";
          break;
      }
      if (roleToAdd && !user.role.includes(roleToAdd as any)) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            role: {
              push: roleToAdd as UserRole, // ← cast to UserRole enum
            },
          },
        });
      }

      // Create counselor profile if subscribing to counselor plan and doesn't exist
      if (plan.category === "COUNSELLOR") {
        const existingCounselor = await tx.counselor.findUnique({
          where: { userId: user.id },
        });
        if (!existingCounselor) {
          await tx.counselor.create({
            data: {
              userId: user.id,
              bio: "",
              specialty: "GENERAL", // Default specialty
              pricePerHour: 3000, // Default price
              rating: 0,
              reviews: 0,
              available: true,
              verified: false,
            },
          });
        }
      }

      return { subscription, payment };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message:
        plan.price === 0
          ? "Subscription activated successfully!"
          : "Subscription created. Please complete payment.",
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create subscription",
      },
      { status: 500 },
    );
  }
}
