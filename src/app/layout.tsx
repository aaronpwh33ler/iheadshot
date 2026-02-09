import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "iHeadshot - Professional AI Headshots in Minutes",
  description:
    "Get stunning professional headshots without a photographer. Upload a selfie and get professional photos in minutes. Starting at just $9.99.",
  keywords: [
    "AI headshots",
    "professional headshots",
    "LinkedIn photos",
    "AI photography",
    "headshot generator",
    "iHeadshot",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
  openGraph: {
    title: "iHeadshot - Professional AI Headshots in Minutes",
    description:
      "Get stunning professional headshots without a photographer. Upload a selfie and get instant results.",
    type: "website",
    url: "https://www.iheadshot.co",
    siteName: "iHeadshot",
    images: [
      {
        url: "https://www.iheadshot.co/og-image.png",
        width: 1200,
        height: 630,
        alt: "iHeadshot - Professional AI headshots powered by AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iHeadshot - Professional AI Headshots in Minutes",
    description:
      "Get stunning professional headshots without a photographer. Upload a selfie and get instant results.",
    images: ["https://www.iheadshot.co/og-image.png"],
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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
