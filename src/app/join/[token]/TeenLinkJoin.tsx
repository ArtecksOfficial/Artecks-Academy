"use client";
// ─── Teen link: a 13–17-year-old attaches their own account to their family ──
// The parent makes the link on /account; the teen opens it while logged in.

import { useState } from "react";
import Link from "next/link";
import LineLoginButton from "@/app/components/LineLoginButton";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { CHESS_URL } from "@/lib/kid-mode";

export interface StudentLink { kind: "student_link"; first_name: string; claimed: boolean; expired: boolean }

function errorText(code: string, zh: boolean): string {
  switch (code) {
    case "own_account":
      return zh ? "這是家長的帳戶。請登出，改用孩子自己的帳戶開啟這個連結。" : "This is the parent's account. Log out and open the link with the teen's own account.";
    case "is_guardian":
      return zh ? "這個帳戶底下已經有孩子，無法當作孩子的帳戶連結。" : "This account already has kids of its own, so it can't be linked as a kid's account.";
    case "already_linked":
      return zh ? "這個帳戶已經連結到一個家庭了。" : "This account is already linked to a family.";
    case "already_claimed":
      return zh ? "這個連結已經使用過了。請家長重新產生一個。" : "This link has already been used. Ask your parent to make a new one.";
    case "expired":
      return zh ? "這個連結已過期。請家長重新產生一個。" : "This link has expired. Ask your parent to make a new one.";
    default:
      return zh ? "出了點問題，請再試一次。" : "Something went wrong. Please try again.";
  }
}

export default function TeenLinkJoin({ token, link, zh }: { token: string; link: StudentLink; zh: boolean }) {
  const { user, isLoading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const here = `/join/${token}`;

  async function claim() {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/student-links/${token}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: "{}",
    }).catch(() => null);
    const data = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok) { setDone(true); return; }
    setErr(errorText(data?.detail ?? "", zh));
  }

  const box = "rounded-3xl bg-white border border-[#E2DDD2] p-5 flex flex-col gap-4";
  const unusable = !done && (link.claimed || link.expired);

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#A07C34] uppercase">Artecks Academy</p>
        <h1 className="font-serif-tc text-3xl font-black text-[#13223F] mt-2 leading-tight">
          {zh ? `${link.first_name}，連結你的帳戶` : `${link.first_name}, link your account`}
        </h1>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {zh
            ? "連結之後，你在 chess.artecks.com 下棋賺到的寶石會進入家庭寶石，可以折抵課程套票；你的 XP 也會算進學院排行榜。"
            : "Once linked, the gems you earn playing on chess.artecks.com go into your family's gems for lesson-package discounts, and your XP counts on the Academy leaderboard."}
        </p>
      </div>

      {done ? (
        <section className={box}>
          <p className="text-sm font-bold text-[#13223F]">{zh ? "完成！帳戶已連結。" : "Done! Your account is linked."}</p>
          <a href={CHESS_URL} className="rounded-xl bg-[#0E1E3A] hover:bg-[#1C3157] text-white text-sm font-bold py-3 text-center">
            {zh ? "去 chess.artecks.com 下棋 →" : "Play on chess.artecks.com →"}
          </a>
          <Link href="/leaderboard" className="text-center text-sm font-bold text-[#A07C34]">{zh ? "看排行榜 →" : "See the leaderboard →"}</Link>
        </section>
      ) : unusable ? (
        <p className={`${box} text-sm text-gray-700`}>{errorText(link.claimed ? "already_claimed" : "expired", zh)}</p>
      ) : (
        <section className={box}>
          {!user && !isLoading ? (
            <>
              <p className="text-sm text-gray-700">
                {zh ? "請用你自己的帳戶登入（不是家長的帳戶）。" : "Log in with your own account (not your parent's)."}
              </p>
              <LineLoginButton next={here} label={zh ? "使用 LINE 登入" : "Continue with LINE"} />
              <Link href={`/login?next=${encodeURIComponent(here)}`} className="text-center text-sm font-bold text-[#A07C34]">
                {zh ? "或用 Email 登入 / 註冊" : "Or log in / sign up with email"}
              </Link>
            </>
          ) : user ? (
            <>
              <p className="text-sm text-gray-700">
                {zh ? `目前登入的帳戶：${user.username || user.email}` : `Logged in as ${user.username || user.email}`}
              </p>
              <button type="button" onClick={claim} disabled={busy}
                className="rounded-xl bg-[#0E1E3A] hover:bg-[#1C3157] disabled:opacity-60 text-white text-sm font-bold py-3">
                {busy ? "…" : zh ? "連結這個帳戶" : "Link this account"}
              </button>
            </>
          ) : null}
          {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
        </section>
      )}
    </>
  );
}
