import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Safe Folio",
  description: "Paper trading on historical data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-zinc-100`}>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
          {children}
        </div>
      </body>
    </html>
  );
}

