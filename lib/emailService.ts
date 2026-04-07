// lib/emailService.ts
// EmailJS integration for sending branded emails

// Initialize EmailJS on client side (requires emailjs library)
export function initializeEmailJS() {
  if (typeof window !== "undefined") {
    const emailjs = require("@emailjs/browser");
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);
  }
}

interface TemplateParams {
  email: string;
  to_name?: string;
  [key: string]: any;
}

/**
 * Generic function to send email via EmailJS with specific template
 */
async function sendEmailWithTemplate(
  templateId: string,
  params: TemplateParams,
): Promise<boolean> {
  try {
    console.log("Sending email with template:", templateId, "params:", params);
    if (typeof window === "undefined") {
      // Server-side: Use EmailJS API directly
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY, // ← Always use public key
            template_params: params,
            accessToken: process.env.EMAILJS_PRIVATE_KEY, // ← Add this for server-side auth
          }),
        },
      );
      console.log("EmailJS response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("EmailJS error:", errorText);
      }
      return response.ok;
    } else {
      // Client-side: Use EmailJS library
      const emailjs = require("@emailjs/browser");
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        templateId,
        params,
      );
      return true;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send OTP verification email
 */
export async function sendOTPVerificationEmail(
  email: string,
  otp: string,
  userName?: string,
): Promise<boolean> {
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();
  return sendEmailWithTemplate(
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_OTP!,
    {
      email,
      to_name: userName || email,
      passcode: otp,
      time: expirationTime,
      user_name: userName,
    },
  );
}

/**
 * Send forgot password OTP email
 */
export async function sendForgotPasswordOTPEmail(
  email: string,
  otp: string,
  userName?: string,
): Promise<boolean> {
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();
  return sendEmailWithTemplate(
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_FORGOT_PASSWORD!,
    {
      email,
      to_name: userName || email,
      passcode: otp,
      time: expirationTime,
      user_name: userName,
    },
  );
}

/**
 * Send successful registration email
 */
export async function sendSuccessfulRegistrationEmail(
  email: string,
  userName: string,
): Promise<boolean> {
  return sendEmailWithTemplate(
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REGISTRATION!,
    {
      email,
      to_name: userName,
      user_name: userName,
    },
  );
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  userName: string,
  orderNumber: string,
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>,
  shipping: number = 0,
  tax: number = 0,
): Promise<boolean> {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + shipping + tax;

  return sendEmailWithTemplate(
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_ORDER!,
    {
      email,
      to_name: userName,
      user_name: userName,
      order_id: orderNumber,
      orders: items.map((item) => ({
        name: item.name,
        units: item.quantity,
        price: item.price,
        image_url: item.image_url || "",
      })),
      cost: {
        shipping,
        tax,
        total,
      },
    },
  );
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

/**
 * Generate a random token for password reset (e.g., 32 characters)
 */
export function generateToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
