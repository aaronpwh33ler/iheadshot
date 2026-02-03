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
  title: "iHeadshot - Professional AI Headshots in Seconds",
  description:
    "Get stunning professional headshots without a photographer. Upload a selfie and get 10-20 professional photos instantly. Starting at just $4.99.",
  keywords: [
    "AI headshots",
    "professional headshots",
    "LinkedIn photos",
    "AI photography",
    "headshot generator",
    "iHeadshot",
  ],
  openGraph: {
    title: "iHeadshot - Professional AI Headshots in Seconds",
    description:
      "Get stunning professional headshots without a photographer. Upload a selfie and get instant results.",
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
