// lib/emailTemplates.ts
// Email templates for EmailJS with GracyGlobal branding

export const emailTemplates = {
  OTP_VERIFICATION: {
    name: "OTP_VERIFICATION",
    subject: "Verify Your GracyGlobal Account",
  },
  FORGOT_PASSWORD_OTP: {
    name: "FORGOT_PASSWORD_OTP",
    subject: "Reset Your GracyGlobal Password",
  },
  SUCCESSFUL_REGISTRATION: {
    name: "SUCCESSFUL_REGISTRATION",
    subject: "Welcome to GracyGlobal! 🎉",
  },
  ORDER_CONFIRMATION: {
    name: "ORDER_CONFIRMATION",
    subject: "Your Order Has Been Confirmed",
  },
};

// Helper function to generate HTML email templates
export function getOTPVerificationHTML(otp: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #dc143c, #a020f0); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f8f9fa; padding: 40px 20px; text-align: center; }
        .otp-box { background: white; border: 2px solid #a020f0; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block; }
        .otp-code { font-size: 36px; font-weight: bold; color: #dc143c; letter-spacing: 4px; font-family: monospace; }
        .otp-info { color: #666; font-size: 14px; margin-top: 15px; }
        .footer { background: #2a2a2a; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
        .footer a { color: #a020f0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Email Verification</h1>
          <p style="margin: 10px 0 0 0;">GracyGlobal</p>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName || "there"}! 👋</h2>
          <p style="color: #666; margin-bottom: 30px;">
            Welcome to GracyGlobal. To verify your email address, please use this one-time code:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-info">Valid for 10 minutes</div>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this code, please ignore this email or contact support.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 GracyGlobal. All rights reserved.</p>
          <p><a href="https://gracyglobal.com">Visit our website</a> | <a href="mailto:support@gracyglobal.com">Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getForgotPasswordOTPHTML(
  otp: string,
  userName?: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #dc143c, #a020f0); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f8f9fa; padding: 40px 20px; text-align: center; }
        .otp-box { background: white; border: 2px solid #dc143c; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block; }
        .otp-code { font-size: 36px; font-weight: bold; color: #a020f0; letter-spacing: 4px; font-family: monospace; }
        .otp-info { color: #dc143c; font-size: 14px; margin-top: 15px; font-weight: bold; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; color: #856404; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: left; font-size: 14px; }
        .footer { background: #2a2a2a; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
        .footer a { color: #a020f0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
          <p style="margin: 10px 0 0 0;">GracyGlobal</p>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName || "there"}! 👋</h2>
          <p style="color: #666; margin-bottom: 30px;">
            We received a request to reset your password. Use this code to proceed:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-info">⏱️ Valid for 15 minutes</div>
          </div>
          <div class="warning">
            <strong>⚠️ Security Note:</strong> Never share this code with anyone. GracyGlobal support will never ask for this code.
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 GracyGlobal. All rights reserved.</p>
          <p><a href="https://gracyglobal.com">Visit our website</a> | <a href="mailto:support@gracyglobal.com">Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getSuccessfulRegistrationHTML(
  userName: string,
  email: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { background: #f8f9fa; padding: 40px 20px; }
        .success-box { background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .success-box h3 { color: #166534; margin-top: 0; }
        .features { list-style: none; padding: 0; }
        .features li { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .features li:last-child { border-bottom: none; }
        .features li:before { content: "✓ "; color: #22c55e; font-weight: bold; margin-right: 10px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #dc143c, #a020f0); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { background: #2a2a2a; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
        .footer a { color: #a020f0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to GracyGlobal!</h1>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>
          <p style="color: #666;">Your account has been successfully created. Here's what you can do now:</p>
          
          <div class="success-box">
            <h3>Get Started in 3 Steps:</h3>
            <ul class="features">
              <li>Complete your profile to unlock all features</li>
              <li>Browse courses, jobs, and services</li>
              <li>Connect with counselors and mentors</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gracyglobal.com/dashboard" class="cta-button">Go to Dashboard</a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Account Email:</strong> ${email}<br>
            <strong>Account Status:</strong> <span style="color: #22c55e;">✓ Active</span>
          </p>

          <p style="color: #999; font-size: 13px; margin-top: 20px;">
            Questions? Check out our <a href="https://gracyglobal.com/help" style="color: #a020f0;">Help Center</a> or reach out to <a href="mailto:support@gracyglobal.com" style="color: #a020f0;">support@gracyglobal.com</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 GracyGlobal. All rights reserved.</p>
          <p><a href="https://gracyglobal.com">Visit our website</a> | <a href="mailto:support@gracyglobal.com">Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getOrderConfirmationHTML(
  orderNumber: string,
  userName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
): string {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #dc143c, #a020f0); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f8f9fa; padding: 40px 20px; }
        .order-box { background: white; border: 1px solid #e0e0e0; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .order-number { background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px; }
        .order-number-label { color: #999; font-size: 12px; }
        .order-number-value { font-size: 20px; font-weight: bold; color: #dc143c; }
        .items-list { border-top: 1px solid #e0e0e0; padding-top: 20px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .item:last-child { border-bottom: none; }
        .item-name { flex: 1; }
        .item-qty { color: #999; font-size: 14px; margin: 0 15px; }
        .item-price { font-weight: bold; }
        .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; color: #333; border-top: 2px solid #a020f0; margin-top: 15px; }
        .status-badge { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .next-steps { background: #f0f4ff; border-left: 4px solid #a020f0; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #dc143c, #a020f0); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
        .footer { background: #2a2a2a; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
        .footer a { color: #a020f0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0;">GracyGlobal Marketplace</p>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #666;">Thank you for your order! We've received it and will process it shortly.</p>
          
          <div class="order-box">
            <div class="order-number">
              <div class="order-number-label">Order Number</div>
              <div class="order-number-value">${orderNumber}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #666;">Status</span>
              <span class="status-badge">PENDING</span>
            </div>

            <div class="items-list">
              <strong style="display: block; margin-bottom: 10px;">Order Items</strong>
              ${items
                .map(
                  (item) => `
                <div class="item">
                  <div class="item-name">${item.name}</div>
                  <div class="item-qty">× ${item.quantity}</div>
                  <div class="item-price">${(item.price * item.quantity).toLocaleString()} XAF</div>
                </div>
              `,
                )
                .join("")}
              <div class="total-row">
                <span>Total Amount</span>
                <span>${total.toLocaleString()} XAF</span>
              </div>
            </div>
          </div>

          <div class="next-steps">
            <strong>What's Next?</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>We'll process your order within 24 hours</li>
              <li>You'll receive shipping updates via email</li>
              <li>Estimated delivery: 3-7 business days</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="https://gracyglobal.com/dashboard/orders" class="cta-button">Track Your Order</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 GracyGlobal. All rights reserved.</p>
          <p><a href="https://gracyglobal.com">Visit our website</a> | <a href="mailto:support@gracyglobal.com">Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
