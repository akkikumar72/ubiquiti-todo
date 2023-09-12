export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import "./globals.css";

export const metadata: Metadata = {
  title: "Ubiquiti - Rethinking IT",
  description: "ubiquiti TODO Assignment",
  authors: [{ name: "Akash", url: "https://github.com/akkikumar72" }],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-zinc-950 text-zinc-100 transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}
