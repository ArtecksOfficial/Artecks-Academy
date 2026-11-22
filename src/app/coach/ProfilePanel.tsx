"use client";
// Coach dashboard → Profile: the coach edits what parents see on /coaches.

import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";
import { startLineLink } from "@/lib/line-login";
import ProfileFields, { EMPTY_PROFILE, type CoachProfile } from "./ProfileFields";

// Coaches get a LINE message for every lesson booked with them once LINE is
// connected here and they've added the Artecks Academy LINE account.
function LineAlertsCard({ zh }: { zh: boolean }) {
  const [st, setSt] = useState<{ linked: boolean; is_friend?: boolean; display_name?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/line", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { linked: false })).then(setSt).catch(() => setSt({ linked: false }));
  }, []);
  if (!st) return null;
  const on = st.linked && st.is_friend !== false;
  return (
    <div className={`rounded-3xl border p-5 flex flex-col gap-3 ${on ? "bg-emerald-50 border-emerald-200" : "bg-[#FBF5E8] border-[#E7C98A]"}`}>
      <p className="text-sm font-black text-[#13223F]">
        {on ? (zh ? "✅ LINE 預約通知：已開啟" : "✅ LINE booking alerts: on")
            : (zh ? "🔔 開啟 LINE 預約通知" : "🔔 Turn on LINE booking alerts")}
      </p>
      <p className="text-xs text-gray-600 leading-relaxed">
        {on ? (zh ? `每當家長預約你的課，Artecks Academy 會傳 LINE 給你（${st.display_name ?? ""}）。`
                  : `Artecks Academy will message you on LINE (${st.display_name ?? ""}) whenever a parent books you.`)
            : st.linked
              ? (zh ? "你的 LINE 已連結，但還沒加 Artecks Academy 為好友（或已封鎖）。請再按一次並加入好友。"
                    : "Your LINE is connected, but you haven't added Artecks Academy as a friend (or blocked it). Tap below again and add it as a friend.")
              : (zh ? "連結你的 LINE，並在下一步「加入好友」，家長預約你時就會收到通知。"
                    : "Connect your LINE and tap \"Add friend\" on the next screen. You'll get a message whenever a parent books you.")}
      </p>
      {!on && (
        <button type="button" onClick={async () => setErr(await startLineLink("/coach?tab=profile", authHeaders()))}
          className="self-start rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-5 py-2.5 text-sm">
          {zh ? "連結 LINE" : "Connect LINE"}
        </button>
      )}
      {err && <p role="alert" className="text-xs text-red-500">{err}</p>}
    </div>
  );
}

export default function ProfilePanel({ zh, onSaved }: { zh: boolean; onSaved: (name: string) => void }) {
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/coach/me", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProfile(d ? { ...EMPTY_PROFILE, ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v ?? ""])) } as CoachProfile : EMPTY_PROFILE))
      .catch(() => setProfile(EMPTY_PROFILE));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true); setMsg(null);
    const { name, name_zh, title, bio, subjects, avatar_initials, line_id } = profile;
    const r = await fetch("/api/coach/me", {
      method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, name_zh, title, bio, subjects, avatar_initials, line_id }),
    }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) return setMsg({ ok: false, text: zh ? "無法儲存，請確認姓名已填寫。" : "Couldn't save. Make sure your name is filled in." });
    setMsg({ ok: true, text: zh ? "已儲存。" : "Saved." });
    onSaved(name);
  }

  if (!profile) return <Loader2 className="animate-spin text-gray-300" />;
  return (
    <div className="flex flex-col gap-4">
    <LineAlertsCard zh={zh} />
    <form onSubmit={save} className="rounded-3xl bg-white border border-gray-200 p-5 flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        {zh ? "這些資料會顯示在「教練與課程」頁，讓家長認識你。" : "This is what parents see about you on the Coaches & programs page."}
      </p>
      <ProfileFields value={profile} onChange={setProfile} zh={zh} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy || !profile.name.trim()}
          className="rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "…" : zh ? "儲存" : "Save"}</button>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </form>
    </div>
  );
}
