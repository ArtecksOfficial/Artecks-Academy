"use client";
// ─── Family invite: an existing family claims their kids + XP in one step ────
// The same /join/<token> address also serves teen links (a parent links a
// 13–17-year-old's own account): if the token is not a family invite we look
// it up as a teen link and show TeenLinkJoin instead.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import LineLoginButton from "@/app/components/LineLoginButton";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TeenLinkJoin, { StudentLink } from "./TeenLinkJoin";

interface Kid { id: number; first_name: string; age: number; past_xp: number }
interface Invite { parent_name: string; claimed: boolean; claimed_by_me: boolean; kids: Kid[] }
type Pick = { opt_in: boolean; nickname: string };

const input = "w-full rounded-xl border border-[#E2DDD2] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#C49A4A]";

export default function JoinClient({ token }: { token: string }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [inv, setInv] = useState<Invite | null | "missing">(null);
  const [picks, setPicks] = useState<Record<number, Pick>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [teenLink, setTeenLink] = useState<StudentLink | null>(null);

  useEffect(() => {
    let stale = false;
    const tryTeenLink = () =>
      fetch(`/api/student-links/${token}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: StudentLink | null) => {
          if (stale) return;
          if (d?.kind === "student_link") setTeenLink(d);
          else setInv("missing");
        })
        .catch(() => { if (!stale) setInv("missing"); });

    fetch(`/api/invites/${token}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Invite | null) => {
        if (stale) return;
        if (!d || !Array.isArray(d.kids)) return tryTeenLink();
        setInv(d);
        setPicks(Object.fromEntries(d.kids.map((k) => [k.id, { opt_in: true, nickname: "" }])));
      })
      .catch(() => { if (!stale) setInv("missing"); });
    return () => { stale = true; };
  }, [token, user]);

  async function claim() {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/invites/${token}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ kids: Object.entries(picks).map(([id, p]) => ({ id: Number(id), ...p })) }),
    }).catch(() => null);
    setBusy(false);
    if (r?.ok) { router.push("/leaderboard?welcome=1"); return; }
    setErr(r?.status === 409
      ? (zh ? "這個邀請已被其他帳號使用。請用 LINE 聯絡我們。" : "This invite was already used by another account. Message us on LINE.")
      : (zh ? "出了點問題，請再試一次。" : "Something went wrong. Please try again."));
  }

  const here = `/join/${token}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2" }}>
      <SiteHeader />
      <main className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-5">
        {teenLink && <TeenLinkJoin token={token} link={teenLink} zh={zh} />}
        {!teenLink && inv === null && <Loader2 className="animate-spin text-gray-300 mx-auto" size={24} />}
        {!teenLink && inv === "missing" && (
          <p className="text-center text-sm text-gray-600">
            {zh ? "找不到這個邀請連結。請用 LINE 聯絡我們。" : "We couldn't find this invite. Please message us on LINE."}
          </p>
        )}
        {!teenLink && inv && inv !== "missing" && (
          <>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#A07C34] uppercase">Artecks Academy</p>
              <h1 className="font-serif-tc text-3xl font-black text-[#13223F] mt-2 leading-tight">
                {zh ? `${inv.parent_name}，歡迎加入！` : `Welcome, ${inv.parent_name}!`}
              </h1>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {zh
                  ? "我們已為您的孩子準備好帳戶，包含過去上課累積的經驗值。登入後即可查看排行榜、課程與寶石。"
                  : "Your kids' profiles are ready, with XP for the lessons they've already taken. Log in to see the leaderboard, your lessons and your gems."}
              </p>
            </div>

            {inv.claimed && !inv.claimed_by_me ? (
              <p className="rounded-2xl bg-white border border-[#E2DDD2] p-5 text-sm text-gray-700">
                {zh ? "這個邀請已經使用過了。如果是您本人，請登入原本的帳號。" : "This invite has already been used. If that was you, log in with the same account."}
                <Link href="/leaderboard" className="block mt-3 font-bold text-[#A07C34]">{zh ? "前往排行榜 →" : "Go to the leaderboard →"}</Link>
              </p>
            ) : (
              <section className="rounded-3xl bg-white border border-[#E2DDD2] p-5 flex flex-col gap-4">
                {inv.kids.map((k) => (
                  <div key={k.id} className="rounded-2xl bg-[#F7F6F2] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#13223F]">{k.first_name} · {k.age}</span>
                      {k.past_xp > 0 && <span className="text-sm font-black text-[#A07C34] tabular-nums">⚡ {k.past_xp.toLocaleString()} XP</span>}
                    </div>
                    {user && (
                      <>
                        <label className="flex items-center gap-3 text-sm cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-[#C49A4A]" checked={picks[k.id]?.opt_in ?? true}
                            onChange={(e) => setPicks((p) => ({ ...p, [k.id]: { ...p[k.id], opt_in: e.target.checked } }))} />
                          <span className="text-gray-800">{zh ? "顯示在排行榜上（只顯示暱稱）" : "Show on the leaderboard (nickname only)"}</span>
                        </label>
                        <input className={input} maxLength={20} placeholder={zh ? `暱稱（留空 = ${k.first_name}）` : `Nickname (empty = ${k.first_name})`}
                          value={picks[k.id]?.nickname ?? ""}
                          onChange={(e) => setPicks((p) => ({ ...p, [k.id]: { ...p[k.id], nickname: e.target.value } }))} />
                      </>
                    )}
                  </div>
                ))}

                {!user && !isLoading ? (
                  <div className="flex flex-col gap-3">
                    <LineLoginButton next={here} label={zh ? "用 LINE 登入（一鍵完成）" : "Continue with LINE (one tap)"} />
                    <Link href={`/login?next=${encodeURIComponent(here)}`} className="text-center text-sm font-bold text-[#A07C34]">
                      {zh ? "或用 Email 登入 / 註冊" : "Or log in / sign up with email"}
                    </Link>
                  </div>
                ) : user ? (
                  <button type="button" onClick={claim} disabled={busy}
                    className="rounded-xl bg-[#0E1E3A] hover:bg-[#1C3157] disabled:opacity-60 text-white text-sm font-bold py-3">
                    {busy ? "…" : zh ? "完成，帶我去排行榜" : "Done — take me to the leaderboard"}
                  </button>
                ) : null}
                {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
