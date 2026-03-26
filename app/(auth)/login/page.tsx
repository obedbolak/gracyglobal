// app/(auth)/login/page.tsx

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "var(--bg-base)",
        backgroundImage: "var(--bg-gradient)",
      }}
    >
      <div className="w-16 h-16 border-4 border-[var(--purple)]/30 border-t-[var(--purple)] rounded-full animate-spin" />
    </div>
  );
}
