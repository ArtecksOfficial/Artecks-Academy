"use client";
// The link in the verification email (/verify-email?uid=…&token=…) lands here.
//
// Designed like the login/sign-up screens (navy, Artecks logo, gold accents) and,
// following common practice for this page, it confirms success clearly and moves
// people forward instead of ending on a bare "you can sign in": one main button
// (Sign in) plus what happens next for parents and for coaches.

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, GraduationCap, Loader2, MailWarning, Trophy, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type State = "working" | "ok" | "bad";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E1E3A] px-4 py-12 sm:py-16">
      {/* soft gold glow + faint chessboard, so the page doesn't feel empty */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#C49A4A]/20 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%),linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%)",
          backgroundSize: "56px 56px",
          backgroundPosition: "0 0,28px 28px",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-9 w-auto invert" />
          <span className="flex flex-col leading-tight text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">Artecks</span>
            <span className="text-base font-black text-white">Academy</span>
          </span>
        </Link>
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function NextStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C49A4A]/15 text-[#E7C98A]">{icon}</span>
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="block text-xs leading-relaxed text-white/55">{text}</span>
      </span>
    </li>
  );
}

export default function VerifyEmailPage() {
  const zh = useLanguage().locale === "zh";
  const [state, setState] = useState<State>("working");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const uid = q.get("uid");
    const token = q.get("token");
    if (!uid || !token) { setState("bad"); return; }
    fetch(`/api/auth/verify-email?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`)
      .then((r) => setState(r.ok ? "ok" : "bad"))
      .catch(() => setState("bad"));
  }, []);

  if (state === "working") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="mb-4 animate-spin text-[#E7C98A]" size={36} />
          <h1 className="text-xl font-black text-white">{zh ? "正在驗證你的電子郵件…" : "Verifying your email…"}</h1>
        </div>
      </Shell>
    );
  }

  if (state === "bad") {
    return (
      <Shell>
        <div className="text-center">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
            <MailWarning size={30} />
          </span>
          <h1 className="text-2xl font-black text-white">{zh ? "這個連結無法使用" : "This link didn't work"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {zh
              ? "連結可能已過期，或已經用過。請到登入頁面輸入帳號密碼，再按「重新寄送驗證信」取得新的連結。"
              : "It may have expired or already been used. Sign in with your email and password, then tap “Resend verification email” for a fresh link."}
          </p>
          <Link href="/login" className="mt-7 block w-full rounded-xl bg-[#C49A4A] py-3 text-sm font-bold text-[#0E1E3A] transition-colors hover:bg-[#D4AE63]">
            {zh ? "前往登入" : "Go to sign in"}
          </Link>
          <p className="mt-4 text-xs text-white/40">
            {zh ? "還是不行？" : "Still stuck?"}{" "}
            <a href="https://line.me/R/ti/p/%40843yqhoa" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#E7C98A] hover:underline">
              {zh ? "用 LINE 聯絡我們" : "Message us on LINE"}
            </a>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center">
        <span className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#C49A4A]/20 [animation-iteration-count:2]" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E7C98A] to-[#C49A4A] text-[#0E1E3A] shadow-lg shadow-[#C49A4A]/30">
            <CheckCircle2 size={40} strokeWidth={2.4} />
          </span>
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E7C98A]">{zh ? "驗證完成" : "You're verified"}</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{zh ? "歡迎加入 Artecks Academy！" : "Welcome to Artecks Academy!"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {zh ? "你的電子郵件已確認。登入後就可以開始了。" : "Your email is confirmed. Sign in to get started."}
        </p>
        <Link href="/login" className="mt-7 block w-full rounded-xl bg-[#C49A4A] py-3 text-sm font-bold text-[#0E1E3A] transition-colors hover:bg-[#D4AE63]">
          {zh ? "登入" : "Sign in"}
        </Link>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{zh ? "接下來" : "What's next"}</p>
        <ul className="flex flex-col gap-4">
          <NextStep
            icon={<Users size={16} />}
            title={zh ? "家長：新增孩子" : "Parents: add your kids"}
            text={zh ? "在設定裡加入孩子的名字，他們就能累積 XP。" : "Add each child in Settings so they can start earning XP."}
          />
          <NextStep
            icon={<CalendarPlus size={16} />}
            title={zh ? "預約第一堂課" : "Book a first lesson"}
            text={zh ? "第一次來？先預約一堂體驗課。" : "New here? Start with a trial lesson in Linkou."}
          />
          <NextStep
            icon={<GraduationCap size={16} />}
            title={zh ? "教練：完成個人資料" : "Coaches: finish your profile"}
            text={zh ? "連結 LINE 並填寫收款帳戶，才能開始接課。" : "Connect LINE and add your bank account to start taking bookings."}
          />
          <NextStep
            icon={<Trophy size={16} />}
            title={zh ? "登上排行榜" : "Climb the leaderboard"}
            text={zh ? "每堂課都能賺 XP，累積到里程碑還有商店優惠券。" : "Every lesson earns XP, and milestones unlock store coupons."}
          />
        </ul>
      </div>
    </Shell>
  );
}
