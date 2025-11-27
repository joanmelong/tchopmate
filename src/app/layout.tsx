import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { GlobalLogoutButton } from "@/components/global-logout-button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TchopMate - Restaurant Universitaire",
  description: "Application de restaurant universitaire pour étudiants",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col`}>
        <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">TchopMate</Link>
            <GlobalLogoutButton />
          </div>
        </header>
        <main className="flex-1">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
