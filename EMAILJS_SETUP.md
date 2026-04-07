# EmailJS Integration Setup Guide

This document explains how to set up EmailJS for sending branded emails in your GracyGlobal application.

## Overview

You have 4 email templates available:

1. **OTP Verification** - For email verification during registration
2. **Forgot Password OTP** - For password reset requests
3. **Successful Registration** - Welcome email after account creation
4. **Order Confirmation** - Order confirmation with details

All templates use your brand colors (Crimson Red #dc143c and Purple #a020f0).

## Step 1: Set Up EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com) and sign up for a free account
2. In the dashboard, take note of:
   - **Public Key** - needed for client-side initialization
   - **Service ID** - your email service (Gmail, Outlook, etc.)
   - **Template ID** - for each email template

## Step 2: Create Email Templates in EmailJS Dashboard

1. Go to **Email Templates** in your EmailJS dashboard
2. Create a new template with the following settings:

### Template Configuration

**Name:** Generic HTML Email Template (or similar)

**Template Variables:**

```
{{to_email}}
{{to_name}}
{{subject}}
{{html_content}}
{{reply_to}}
```

**Email Content (HTML):**

```html
Subject: {{subject}} To: {{to_name}} <{{to_email}}> Reply-To: {{reply_to}}
{{{html_content}}}
```

3. Save the template and note its **Template ID**

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_from_emailjs
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_from_emailjs
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_GENERIC=your_template_id_from_emailjs
```

**Note:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser. Keep your private keys in regular env variables if needed for server-only operations.

## Step 4: Client-Side Initialization (Optional)

If you want to send emails from the client side, initialize EmailJS in your app layout or main component:

```tsx
// app/layout.tsx or pages/_app.tsx
import { initializeEmailJS } from "@/lib/emailService";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeEmailJS();
    }
  }, []);

  return <>{children}</>;
}
```

## Step 5: Use Email Functions

### 1. Send OTP Verification Email

```tsx
import { sendOTPVerificationEmail } from "@/lib/emailService";

// In your registration flow
const otp = generateOTP(6); // Returns a 6-digit OTP
await sendOTPVerificationEmail(
  userEmail,
  otp,
  userName, // optional
);
```

### 2. Send Forgot Password OTP

```tsx
import { sendForgotPasswordOTPEmail } from "@/lib/emailService";

const otp = generateOTP(6);
await sendForgotPasswordOTPEmail(
  userEmail,
  otp,
  userName, // optional
);
```

### 3. Send Registration Welcome Email

```tsx
import { sendSuccessfulRegistrationEmail } from "@/lib/emailService";

// After successful registration
await sendSuccessfulRegistrationEmail(userEmail, userName);
```

### 4. Send Order Confirmation Email

```tsx
import { sendOrderConfirmationEmail } from "@/lib/emailService";

await sendOrderConfirmationEmail(customerEmail, customerName, orderNumber, [
  { name: "Product Name", quantity: 2, price: 5000 },
  { name: "Service Name", quantity: 1, price: 10000 },
]);
```

## Step 6: Add OTP Storage to Database (Recommended)

Update your Prisma schema to store OTPs:

```prisma
// Add to User model in prisma/schema.prisma
model User {
  // ... existing fields ...
  otp            String?
  otpExpiresAt   DateTime?
  otpVerified    Boolean   @default(false)
  otpAttempts    Int       @default(0)

  // ... rest of model ...
}

// Or create a separate OTP table
model VerificationOTP {
  id        String   @id @default(cuid())
  userId    String
  code      String
  type      String   @default("VERIFICATION") // VERIFICATION, PASSWORD_RESET
  expiresAt DateTime
  used      Boolean  @default(false)
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("verification_otps")
}
```

Then run:

```bash
npx prisma migrate dev --name add_otp_support
```

## Example API Routes

### Registration with Welcome Email

```typescript
// app/api/auth/register/route.ts
import { sendSuccessfulRegistrationEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  // ... create user ...

  // Send welcome email (don't fail if it errors)
  try {
    await sendSuccessfulRegistrationEmail(user.email, user.name!);
  } catch (err) {
    console.warn("Failed to send welcome email:", err);
    // Continue anyway
  }

  return ok({ user });
}
```

### Forgot Password with OTP

```typescript
// app/api/auth/forgot-password/route.ts
import { sendForgotPasswordOTPEmail, generateOTP } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return ok({ message: "If email exists, OTP sent" }); // Security
  }

  const otp = generateOTP(6);

  // Store OTP
  await prisma.verificationOTP.create({
    data: {
      userId: user.id,
      code: otp,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  });

  // Send email
  await sendForgotPasswordOTPEmail(email, otp, user.name);

  return ok({ message: "OTP sent" });
}
```

### Order Confirmation

```typescript
// Add to app/api/orders/route.ts POST handler
import { sendOrderConfirmationEmail } from "@/lib/emailService";

// After creating order
const order = await prisma.order.create({ ... });

// Send confirmation
await sendOrderConfirmationEmail(
  user.email,
  user.name || "Customer",
  `GG-${order.id.slice(0, 8).toUpperCase()}`,
  order.items.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
  }))
);
```

## Email Templates Styling

All templates include:

- **Brand Colors:** Crimson Red (#dc143c) and Purple (#a020f0)
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Professional Layout:** Header, content, and footer sections
- **Clear CTAs:** Action buttons matched to your brand

### Customization

You can customize templates in `/lib/emailTemplates.ts`:

- Colors
- Company info
- Links
- Copy/text
- Images

## Testing

### Test in Development

1. Use a test email address in your .env.local
2. Create a simple test endpoint:

```typescript
// app/api/email/test/route.ts
import { sendOTPVerificationEmail } from "@/lib/emailService";

export async function GET() {
  await sendOTPVerificationEmail(
    "your-email@example.com",
    "123456",
    "Test User",
  );
  return Response.json({ success: true });
}
```

3. Visit `http://localhost:3000/api/email/test` to trigger the email

### Monitor EmailJS

1. Go to your EmailJS dashboard
2. Check **Activity** log to see sent emails
3. Check **Logs** for any failures

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables:**
   - Ensure all three vars are set correctly
   - Restart dev server after adding env vars

2. **Check EmailJS Dashboard:**
   - Verify template ID is correct
   - Check email quota (free tier has limits)
   - Review activity logs for errors

3. **Check Email Validity:**
   - Verify recipient email is valid
   - Check sender email configuration in EmailJS

4. **CORS Issues (Client-Side):**
   - If sending from client, check CORS settings in EmailJS
   - Better to send from server-side API routes

### High Email Volume

- EmailJS free tier: 200 emails/month
- Consider upgrading plan for production
- Implement email queuing for reliability

## Best Practices

1. **Always validate email addresses** before sending
2. **Store OTPs securely** with expiration times
3. **Rate limit OTP requests** (e.g., max 5 per hour)
4. **Use server-side routes** for sending sensitive emails
5. **Test with real email first** before deploying
6. **Monitor email delivery** via EmailJS dashboard
7. **Handle failures gracefully** - don't block user flows if email fails

## Next Steps

1. ✅ Set up EmailJS account
2. ✅ Create email template
3. ✅ Add environment variables
4. ✅ Test with test endpoint
5. ✅ Integrate into auth/registration flows
6. ✅ Add OTP storage to database
7. ✅ Deploy to production

Good luck! 🚀
