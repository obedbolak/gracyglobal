import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

interface CartItem {
  productId: string;
  quantity: number;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return err("Unauthorized", 401);
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return ok(orders);
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return err("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return err("Unauthorized", 401);
    }

    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return err("Cart is empty");
    }

    const productIds = items.map((item: CartItem) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return err("One or more products are invalid");
    }

    const orderItems = items.map((item: CartItem) => {
      const product = products.find((product) => product.id === item.productId);
      return {
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
        price: product?.price ?? 0,
      };
    });

    const total = orderItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    const emailItems = order.items.map((item) => {
      const product = products.find((product) => product.id === item.productId);
      return {
        name: product?.name || "Product",
        quantity: item.quantity,
        price: item.price,
        image_url: product?.images?.[0] || "",
      };
    });

    const emailSent = await sendOrderConfirmationEmail(
      user.email,
      user.name || user.email,
      order.id,
      emailItems,
    );

    if (!emailSent) {
      console.warn(
        "Failed to send order confirmation email for order",
        order.id,
      );
    }

    return ok(order, 201);
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return err("Internal server error", 500);
  }
}
