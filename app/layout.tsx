import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
