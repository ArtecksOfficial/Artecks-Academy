"use client";
// ─── Teach with us: teachers sign themselves up ──────────────────────────────
// Signed out → log in / sign up first. Signed in → fill in the profile parents
// will see and apply. They can set their hours and calendar straight away in
// the coach dashboard; they stay hidden from parents until the owner approves.

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, GraduationCap, Loader2 } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ProfileFields, { EMPTY_PROFILE, type CoachProfile } from "@/app/coach/ProfileFields";

interface ApplyStatus { applied: boolean; status: "approved" | "pending" | "rejected" | null; is_active: boolean }

const card = "rounded-3xl bg-white border border-[#E2DDD2] p-6 sm:p-8 shadow-sm";

export default function TeachClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [state, setState] = useState<ApplyStatus | null>(null);
  const [profile, setProfile] = useState<CoachProfile>(EMPTY_PROFILE);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfile((p) => ({ ...p, name: p.name || [user.first_name, user.last_name].filter(Boolean).join(" ") }));
    fetch("/api/coach/apply", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null)).then((d) => d && setState(d)).catch(() => {});
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const r = await fetch("/api/coach/apply", {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(profile),
    }).catch(() => null);
    setBusy(false);
    if (r && r.status === 201) { router.push("/coach"); return; }
    if (r && r.status === 409) { router.push("/coach"); return; }
    setErr(zh ? "無法送出，請確認姓名與教授科目都已填寫。" : "Couldn't send that. Please check your name and what you teach are filled in.");
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">
        <header>
          <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{zh ? "加入師資團隊" : "Teach with Artecks Academy"}</h1>
          <p className="mt-2 text-sm text-[#5B6478] max-w-2xl">
            {zh
              ? "我們在找能用英文教孩子的老師，西洋棋或任何科目都歡迎。建立你的老師檔案、設定可上課時間與地點；審核通過後，家長就能看到你並預約。"
              : "We're looking for teachers who teach kids in English, chess or any other subject. Create your teacher profile and set the hours and places you can teach. Once we approve you, parents can find and book you."}
          </p>
        </header>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { icon: GraduationCap, en: "1. Create your profile", zh: "1. 建立老師檔案" },
            { icon: Clock, en: "2. Set your hours, places and days off", zh: "2. 設定時間、地點與休假" },
            { icon: CheckCircle2, en: "3. We approve you, parents book you", zh: "3. 審核通過，家長即可預約" },
          ].map((s) => (
            <li key={s.en} className="flex items-center gap-2.5 rounded-2xl bg-white border border-[#E2DDD2] px-4 py-3 font-semibold text-[#13223F]">
              <s.icon size={17} className="text-[#A07C34] shrink-0" aria-hidden /> {zh ? s.zh : s.en}
            </li>
          ))}
        </ol>

        {isLoading ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : !user ? (
          <section className={card}>
            <p className="text-sm text-gray-700">{zh ? "先登入或註冊一個帳號，再建立老師檔案。" : "First log in or create an account, then make your teacher profile."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/signup?next=/teach" className="rounded-xl bg-[#C49A4A] px-5 py-2.5 text-sm font-bold text-[#0E1E3A]">{zh ? "註冊" : "Sign up"}</Link>
              <Link href="/login?next=/teach" className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700">{zh ? "登入" : "Log in"}</Link>
            </div>
          </section>
        ) : state === null ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : state.applied ? (
          <section className={card}>
            {state.status === "rejected" ? (
              <p className="text-sm text-gray-700">{zh ? "謝謝你的申請。目前沒有合適的機會，如有問題請透過 LINE 聯絡我們。" : "Thanks for applying. We don't have a place for you right now. Message us on LINE with any questions."}</p>
            ) : (
              <>
                <p className="text-sm font-bold text-[#13223F]">
                  {state.is_active ? (zh ? "✅ 你已經是 Artecks Academy 的老師了。" : "✅ You're an Artecks Academy teacher.")
                    : (zh ? "⏳ 已收到你的申請，正在等待審核。" : "⏳ We've got your application. It's waiting for approval.")}
                </p>
                <p className="mt-1 text-sm text-gray-600">{zh ? "到教練專區更新檔案、設定時間與地點。" : "Update your profile and set your hours and places in the coach dashboard."}</p>
                <Link href="/coach" className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white">{zh ? "前往教練專區" : "Go to the coach dashboard"}</Link>
              </>
            )}
          </section>
        ) : (
          <form onSubmit={submit} className={`${card} flex flex-col gap-4`}>
            <h2 className="text-base font-black text-[#13223F]">{zh ? "你的老師檔案" : "Your teacher profile"}</h2>
            <p className="-mt-2 text-xs text-gray-500">{zh ? "審核通過後，家長會在「教練與課程」頁看到這些資料。" : "Parents see this on the Coaches & programs page once you're approved."}</p>
            <ProfileFields value={profile} onChange={setProfile} zh={zh} />
            {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
            <button type="submit" disabled={busy || !profile.name.trim() || !profile.subjects.trim()}
              className="self-start rounded-xl bg-[#C49A4A] px-6 py-3 text-sm font-black text-[#0E1E3A] disabled:opacity-50">
              {busy ? "…" : zh ? "送出申請" : "Apply"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
