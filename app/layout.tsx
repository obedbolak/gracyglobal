import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Gracy Global",
  description:
    "Step in, thrive and own your success story with GracyGlobal — your gateway to global opportunities and world excellence. ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="gracyglobal-theme">
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
