import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AuthProvider } from "@/app/components/AuthContext";
import PageViewTracker from '@/components/PageViewTracker'
import { Analytics } from '@vercel/analytics/next';

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const serifTc = Noto_Serif_TC({
  variable: "--font-serif-tc",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  preload: false,
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
      <body
        className={`${jakarta.variable} ${inter.variable} ${serifTc.variable} antialiased`}
        suppressHydrationWarning
      >
      <Suspense fallback={null}><PageViewTracker /></Suspense>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
