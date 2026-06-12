import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Karobar Online — AI Business Search",
  description:
    "Find the best businesses, shops, and services across Pakistan with AI-powered search. Ask anything about local businesses in Karachi and beyond.",
  keywords: ["business search", "Karachi", "Pakistan", "AI", "Karobar Online"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
