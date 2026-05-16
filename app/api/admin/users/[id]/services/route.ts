// app/api/admin/users/[id]/services/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/users/[id]/services - Update user service state and activate free plan
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { serviceType, activate, planCode } = await req.json();

    if (!serviceType || activate === undefined) {
      return NextResponse.json(
        { error: "serviceType and activate are required" },
        { status: 400 }
      );
    }

    // Validate serviceType
    const validServiceTypes = ["COUNSELOR", "TEACHER", "CREATOR", "MARKETPLACE"];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: "Invalid serviceType. Must be one of: " + validServiceTypes.join(", ") },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        counselorProfile: true,
        subscriptions: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedUser = user;

      if (activate) {
        // Add role if not already present
        const currentRoles = Array.isArray(user.role) ? user.role : [user.role];
        if (!currentRoles.includes(serviceType as UserRole)) {
          updatedUser = await tx.user.update({
            where: { id },
            data: {
              role: {
                push: serviceType as UserRole,
              },
            },
          });
        }

        // Create service-specific profiles if needed
        if (serviceType === "COUNSELOR") {
          const existingCounselor = await tx.counselor.findUnique({
            where: { userId: id },
          });
          if (!existingCounselor) {
            await tx.counselor.create({
              data: {
                userId: id,
                bio: "",
                specialty: "GENERAL",
                pricePerHour: 3000,
                rating: 0,
                reviews: 0,
                available: true,
                verified: false,
              },
            });
          }
        }

        // Activate free plan if planCode provided
        if (planCode) {
          const plan = await tx.pricingPlan.findUnique({
            where: { 
              planCode: planCode.toUpperCase(),
              active: true,
            },
          });

          if (!plan) {
            throw new Error(`Plan with code ${planCode} not found`);
          }

          if (plan.price !== 0) {
            throw new Error(`Plan ${planCode} is not a free plan`);
          }

          // Check if user already has this subscription
          const existingSubscription = await tx.userSubscription.findUnique({
            where: {
              userId_planId: {
                userId: id,
                planId: plan.id,
              },
            },
          });

          if (!existingSubscription || existingSubscription.status !== "ACTIVE") {
            const now = new Date();
            let periodEnd = new Date(now);
            periodEnd.setFullYear(periodEnd.getFullYear() + 10); // Far future for free plans

            await tx.userSubscription.upsert({
              where: {
                userId_planId: {
                  userId: id,
                  planId: plan.id,
                },
              },
              create: {
                userId: id,
                planId: plan.id,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
                sessionsUsed: 0,
                leadsUsed: 0,
                productsUsed: 0,
                coursesUsed: 0,
              },
              update: {
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
              },
            });
          }
        }
      } else {
        // Deactivate service - remove role
        const currentRoles = Array.isArray(user.role) ? user.role : [user.role];
        const newRoles = currentRoles.filter(role => role !== serviceType);
        
        // Ensure USER role is always present
        if (!newRoles.includes("USER")) {
          newRoles.push("USER");
        }

        updatedUser = await tx.user.update({
          where: { id },
          data: {
            role: newRoles,
          },
        });

        // Deactivate service-specific profiles
        if (serviceType === "COUNSELOR") {
          await tx.counselor.updateMany({
            where: { userId: id },
            data: { available: false },
          });
        }

        // Deactivate related subscriptions if planCode provided
        if (planCode) {
          const plan = await tx.pricingPlan.findUnique({
            where: { planCode: planCode.toUpperCase() },
          });

          if (plan) {
            await tx.userSubscription.updateMany({
              where: {
                userId: id,
                planId: plan.id,
                status: "ACTIVE",
              },
              data: {
                status: "CANCELLED",
                cancelAtPeriodEnd: true,
              },
            });
          }
        }
      }

      return updatedUser;
    });

    // Fetch updated user with all relations
    const finalUser = await prisma.user.findUnique({
      where: { id },
      include: {
        counselorProfile: true,
        subscriptions: {
          include: { plan: true },
          where: { status: "ACTIVE" },
        },
        _count: {
          select: {
            enrollments: true,
            bookings: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      user: finalUser,
      message: activate 
        ? `${serviceType} service activated successfully` 
        : `${serviceType} service deactivated successfully`
    });

  } catch (error: any) {
    console.error("Update user services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}