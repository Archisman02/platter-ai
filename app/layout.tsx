import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Platter",
  description: "AI-powered food planning assistant with a guided chat flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
