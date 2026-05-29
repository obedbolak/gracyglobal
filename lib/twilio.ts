import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error("Missing Twilio environment variables");
}

export const twilioClient = twilio(accountSid, authToken);
export { verifyServiceSid };

/**
 * Send OTP via SMS or WhatsApp
 * @param to - Phone number in E.164 format e.g. +237612345678
 * @param channel - "sms" | "whatsapp"
 */
export async function sendOtp(to: string, channel: "sms" | "whatsapp" = "sms") {
  const verification = await twilioClient.verify.v2
    .services(verifyServiceSid)
    .verifications.create({ to, channel });

  return verification;
}

/**
 * Verify OTP code entered by user
 * @param to - Phone number in E.164 format
 * @param code - The OTP code the user entered
 */
export async function verifyOtp(to: string, code: string) {
  const result = await twilioClient.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ to, code });

  return result; // result.status === "approved" means success
}
