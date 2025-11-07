import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SavedDigest",
  description: "AI-powered newsletters from your Reddit saved items"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
