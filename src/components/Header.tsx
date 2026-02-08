"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-brand-100/50">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo/logo-white-on-orange.png" alt="iHeadshot logo" className="w-9 h-9 rounded-xl" />
          <span className="text-xl font-bold text-gray-900">iHeadshot</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
