import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Daymark · Make room for what matters",
  description:
    "A calm workspace for tasks, projects, and the days ahead. Built with Next.js and Supabase.",
  authors: [{ name: "Akash Pathak", url: "https://github.com/akkikumar72" }],
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
