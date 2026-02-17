"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isPostCheckout = pathname.startsWith("/upload") || pathname.startsWith("/gallery") || pathname.startsWith("/processing");

  return (
    <>
      {!isLanding && !isPostCheckout && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isLanding && !isPostCheckout && <Footer />}
    </>
  );
}
