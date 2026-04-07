// Example API route for sending order confirmation email
// app/api/email/send-order-confirmation-example.ts

import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userName, orderNumber, items } = body;

    if (!email || !userName || !orderNumber || !Array.isArray(items)) {
      return err("Email, name, order number, and items are required");
    }

    // Validate items format
    const validItems = items.every(
      (item: any) =>
        item.name &&
        typeof item.quantity === "number" &&
        typeof item.price === "number",
    );

    if (!validItems) {
      return err("Invalid items format");
    }

    // Send order confirmation email
    const emailSent = await sendOrderConfirmationEmail(
      email,
      userName,
      orderNumber,
      items,
    );

    if (!emailSent) {
      console.warn("Failed to send order confirmation email");
      // Don't fail the order if email fails
    }

    return ok({
      message: "Order confirmation email sent",
      email,
    });
  } catch (error) {
    console.error("[POST /api/email/send-order-confirmation]", error);
    return err("Internal server error", 500);
  }
}
