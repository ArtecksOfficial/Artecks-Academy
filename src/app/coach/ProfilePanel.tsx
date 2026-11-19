"use client";
// Coach dashboard → Profile: the coach edits what parents see on /coaches.

import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";
import ProfileFields, { EMPTY_PROFILE, type CoachProfile } from "./ProfileFields";

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
    <form onSubmit={save} className="rounded-3xl bg-white border border-gray-200 p-5 flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        {zh ? "這些資料會顯示在「教練與課程」頁，讓家長認識你。" : "This is what parents see about you on the Coaches & programs page."}
      </p>
      <ProfileFields value={profile} onChange={setProfile} zh={zh} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy || !profile.name.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "…" : zh ? "儲存" : "Save"}</button>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </form>
  );
}
