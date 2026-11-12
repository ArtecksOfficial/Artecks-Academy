"use client";
// ─── Kid Mode bar — shown on every page while this device is in Kid Mode ─────
// The only way out is the parent PIN (or logging in again).

import { useEffect, useState, FormEvent } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CHESS_URL, exitKidMode, getKidSession, KidSession, pinErrorText } from "@/lib/kid-mode";

export default function KidModeBar() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [kid, setKid] = useState<KidSession | null>(null);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setKid(getKidSession()); }, []);
  if (!kid) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const failure = await exitKidMode(pin);
    setBusy(false);
    setPin("");
    if (failure) { setErr(pinErrorText(failure, zh)); return; }
    window.location.assign("/account");
  }

  return (
    <div className="bg-[#0E1E3A] text-white text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-bold inline-flex items-center gap-2">
          <Lock size={14} aria-hidden /> {zh ? `兒童模式 · ${kid.first_name}` : `Kid Mode · ${kid.first_name}`}
        </span>
        <a href={CHESS_URL} className="font-semibold text-[#E7C98A] underline-offset-2 hover:underline">
          {zh ? "去下棋 →" : "Play chess →"}
        </a>
        <span className="flex-1" />
        {!open ? (
          <button type="button" onClick={() => setOpen(true)} className="font-semibold text-white/80 hover:text-white">
            {zh ? "家長：離開兒童模式" : "Parents: leave Kid Mode"}
          </button>
        ) : (
          <form onSubmit={submit} className="flex items-center gap-2">
            <label htmlFor="kid-bar-pin" className="sr-only">{zh ? "家長 PIN" : "Parent PIN"}</label>
            <input id="kid-bar-pin" type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{4,6}" maxLength={6}
              required autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder={zh ? "家長 PIN" : "Parent PIN"}
              className="w-28 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none" />
            <button type="submit" disabled={busy || pin.length < 4} className="rounded-lg bg-[#C49A4A] px-3 py-1.5 font-bold text-[#0E1E3A] disabled:opacity-60">
              {busy ? "…" : zh ? "離開" : "Leave"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="text-white/70 hover:text-white">
              {zh ? "取消" : "Cancel"}
            </button>
          </form>
        )}
      </div>
      {err && <p role="alert" className="max-w-5xl mx-auto px-4 pb-2 text-xs text-red-200">{err}</p>}
    </div>
  );
}
