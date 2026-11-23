"use client";
// ─── Settings — everything a parent can change, in one place ─────────────────
// Layout follows common settings-page practice: one column, related settings
// grouped under a plain heading (title + one-line description on the left on
// wide screens, the controls on the right), the most-used group first, and
// "Log out" last.
// Order: Kids → Profile → Password → Language → Log out.

import { useCallback, useEffect, useState, FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import LineLoginButton from "@/app/components/LineLoginButton";
import KidModeCard from "./KidModeCard";
import { AddKid, KidCard } from "@/app/leaderboard/LeaderboardClient";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { getKidSession } from "@/lib/kid-mode";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";

interface Kid {
  id: number; first_name: string; nickname: string; leaderboard_opt_in: boolean;
  age: number; age_group: string; display_name: string; xp_month: number; xp_total: number; linked?: boolean;
}

const card = "rounded-2xl bg-white border border-[#E2DDD2] p-5 sm:p-6 shadow-sm";
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A]";
const primary = "rounded-xl bg-[#0E1E3A] hover:bg-[#1C3157] disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-white";

/** One settings group: heading + description on the left (wide screens), controls on the right. */
function Group({ id, title, desc, children }: { id: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section id={id} className="grid gap-4 border-t border-[#E2DDD2] py-8 first:border-t-0 first:pt-2 lg:grid-cols-[15rem_1fr] lg:gap-10 scroll-mt-24">
      <div>
        <h2 className="text-base font-black text-[#13223F]">{title}</h2>
        {desc && <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

export default function SettingsClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [kids, setKids] = useState<Kid[] | null>(null);
  const [kidMode, setKidMode] = useState(false);

  const loadKids = useCallback(() => {
    fetch("/api/students", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setKids(Array.isArray(d) ? d : []))
      .catch(() => setKids([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (getKidSession()) { setKidMode(true); return; }
    loadKids();
  }, [user, loadKids]);

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{zh ? "設定" : "Settings"}</h1>
        {user && !kidMode && (
          <p className="mt-1 text-sm text-gray-500">
            {zh ? `${user.email ?? ""} 的家庭帳戶` : `Family account for ${user.email ?? ""}`}
          </p>
        )}

        <div className="mt-6">
          {isLoading ? (
            <Loader2 className="animate-spin text-gray-300" />
          ) : !user ? (
            <section className={`${card} flex flex-col gap-4 max-w-md`}>
              <p className="text-sm text-gray-700">{zh ? "登入後即可變更設定。" : "Log in to change your settings."}</p>
              <LineLoginButton next="/settings" label={zh ? "使用 LINE 登入" : "Continue with LINE"} />
              <Link href="/login?next=/settings" className="text-center text-sm font-bold text-[#A07C34]">{zh ? "用 Email 登入" : "Log in with email"}</Link>
              <LanguageRow zh={zh} />
            </section>
          ) : kidMode ? (
            <p className={`${card} text-sm text-gray-700`}>
              {zh ? "這台裝置目前是兒童模式。家長輸入 PIN 離開後才能變更設定。" : "This device is in Kid Mode. Parents can change settings after leaving Kid Mode with their PIN."}
            </p>
          ) : (
            <>
              <Group id="kids" title={zh ? "孩子" : "Kids"}
                desc={zh ? "孩子會用名字出現在排行榜上，請只填名字，不要填姓氏。" : "Each child shows on the leaderboard by first name only, so please leave out surnames."}>
                <div className={card}>
                  {kids === null ? (
                    <Loader2 className="animate-spin text-gray-300" size={18} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {kids.map((k) => <KidCard key={k.id} kid={k} onChange={loadKids} />)}
                      <AddKid onAdded={loadKids} />
                    </div>
                  )}
                </div>
                {kids !== null && <KidModeCard kids={kids} zh={zh} onKidsChanged={loadKids} />}
              </Group>

              <Group id="profile" title={zh ? "個人資料" : "Profile"}
                desc={zh ? "教練和收據上顯示的家長姓名。" : "The parent name coaches and receipts show."}>
                <ProfileSection zh={zh} />
              </Group>

              <Group id="password" title={zh ? "密碼" : "Password"}
                desc={zh ? "只用 LINE 登入的帳戶沒有密碼，不需要設定。" : "Accounts that only sign in with LINE have no password and can skip this."}>
                <PasswordSection zh={zh} />
              </Group>

              <Group id="language" title={zh ? "語言" : "Language"}>
                <div className={card}><LanguageRow zh={zh} /></div>
              </Group>

              <Group id="logout" title={zh ? "登出" : "Log out"}
                desc={zh ? "在這台裝置上登出。" : "Sign out on this device."}>
                <div>
                  <button type="button" onClick={async () => { await logout(); router.push("/"); }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">
                    <LogOut size={16} /> {zh ? "登出" : "Log out"}
                  </button>
                </div>
              </Group>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function LanguageRow({ zh }: { zh: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-600">{zh ? "目前：繁體中文" : "Current: English"}</p>
      <LanguageToggle />
    </div>
  );
}

function ProfileSection({ zh }: { zh: boolean }) {
  const { user, refreshUser } = useAuth();
  const [first, setFirst] = useState(user?.first_name ?? "");
  const [last, setLast] = useState(user?.last_name ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = first.trim() !== (user?.first_name ?? "") || last.trim() !== (user?.last_name ?? "");

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ first_name: first, last_name: last }),
    }).catch(() => null);
    setBusy(false);
    if (r?.ok) {
      await refreshUser();
      setMsg({ ok: true, text: zh ? "已儲存。" : "Saved." });
    } else {
      setMsg({ ok: false, text: zh ? "無法儲存，請再試一次。" : "Couldn't save. Please try again." });
    }
  }

  return (
    <section className={card}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-gray-700">
            {zh ? "名字" : "First name"}
            <input className={`${input} mt-1`} value={first} maxLength={150} autoComplete="given-name" onChange={(e) => setFirst(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-700">
            {zh ? "姓氏" : "Last name"}
            <input className={`${input} mt-1`} value={last} maxLength={150} autoComplete="family-name" onChange={(e) => setLast(e.target.value)} />
          </label>
        </div>
        <label className="text-xs font-semibold text-gray-700">
          Email
          <input className={`${input} mt-1 bg-gray-50 text-gray-500`} value={user?.email ?? ""} readOnly aria-describedby="email-help" />
        </label>
        <p id="email-help" className="text-xs text-gray-500">
          {zh ? "要更改 Email，請用 LINE 聯絡我們。" : "To change your email, message us on LINE."}
        </p>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy || !changed} className={primary}>{busy ? "…" : zh ? "儲存" : "Save"}</button>
          {msg && <p role={msg.ok ? "status" : "alert"} className={`text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        </div>
      </form>
    </section>
  );
}

function PasswordSection({ zh }: { zh: boolean }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (newPw !== again) { setMsg({ ok: false, text: zh ? "兩次輸入的新密碼不一樣。" : "The two new passwords don't match." }); return; }
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
    }).catch(() => null);
    const data = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok) {
      setOldPw(""); setNewPw(""); setAgain("");
      setMsg({ ok: true, text: zh ? "密碼已更新。" : "Password updated." });
      return;
    }
    const backend = Array.isArray(data?.new_password) ? String(data.new_password[0]) : "";
    setMsg({
      ok: false,
      text: data?.old_password
        ? (zh ? "目前的密碼不正確。" : "Your current password is not right.")
        : backend || (zh ? "無法更新密碼，請再試一次。" : "Couldn't update the password. Please try again."),
    });
  }

  return (
    <section className={card}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-700">
          {zh ? "目前的密碼" : "Current password"}
          <input type="password" required autoComplete="current-password" className={`${input} mt-1`} value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-gray-700">
            {zh ? "新密碼" : "New password"}
            <input type="password" required minLength={8} autoComplete="new-password" className={`${input} mt-1`} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-700">
            {zh ? "再輸入一次" : "Type it again"}
            <input type="password" required minLength={8} autoComplete="new-password" className={`${input} mt-1`} value={again} onChange={(e) => setAgain(e.target.value)} />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className={primary}>{busy ? "…" : zh ? "更新密碼" : "Update password"}</button>
          {msg && <p role={msg.ok ? "status" : "alert"} className={`text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        </div>
      </form>
    </section>
  );
}
