import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AuthProvider } from "@/app/components/AuthContext";
import KidModeBar from "@/app/components/KidModeBar";
import PageViewTracker from '@/components/PageViewTracker'
import { Analytics } from '@vercel/analytics/next';

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Artecks Academy",
  description: "林口社區小課 · 棋藝培訓 · Powered by Artecks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* Noto Serif TC is loaded by the browser, not next/font: its CJK build pulls
            hundreds of font slices at build time and one failed fetch breaks the Vercel build. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700;900&display=swap" />
      </head>
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
      <Suspense fallback={null}><PageViewTracker /></Suspense>
        <AuthProvider>
          <LanguageProvider>
            <KidModeBar />
            {children}
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
