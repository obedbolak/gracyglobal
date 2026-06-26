// app/not-found.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to home after 2 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-500">Oops! Page not found</h1>
      <p className="mt-2 text-gray-600">
        Don’t worry — Gracy Assistant will guide you back home.
      </p>
      <p className="mt-4 text-blue-600">Redirecting you to the homepage...</p>
    </div>
  );
}
