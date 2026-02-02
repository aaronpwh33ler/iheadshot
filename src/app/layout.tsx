import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "iHeadshot - Professional AI Headshots in 30 Minutes",
  description:
    "Get stunning professional headshots without a photographer. Upload selfies, let AI learn your features, and download 40+ professional photos in 30 minutes.",
  keywords: [
    "AI headshots",
    "professional headshots",
    "LinkedIn photos",
    "AI photography",
    "headshot generator",
    "iHeadshot",
  ],
  openGraph: {
    title: "iHeadshot - Professional AI Headshots in 30 Minutes",
    description:
      "Get stunning professional headshots without a photographer. Upload selfies and get 40+ professional photos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
