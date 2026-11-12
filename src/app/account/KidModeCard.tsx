"use client";
// ─── Kid Mode on the account page: parent PIN, "Start Kid Mode", teen links ──
//
// PIN + Start Kid Mode are behind NEXT_PUBLIC_KID_MODE_ENABLED (see lib/kid-mode.ts).
// Linking a 13–17-year-old's own account is always available.

import { useCallback, useEffect, useState, FormEvent } from "react";
import { Check, Copy, KeyRound, Link2, Loader2, Play } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";
import { KID_MODE_ENABLED, PinFailure, pinErrorText, startKidMode } from "@/lib/kid-mode";

export interface AccountKid { id: number; first_name: string; age: number; linked?: boolean }

const card = "rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm";
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500";
const TEEN_MIN_AGE = 13;

async function call(path: string, method: "GET" | "POST" | "DELETE", body?: unknown) {
  const r = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null);
  const data = r && r.status !== 204 ? await r.json().catch(() => ({})) : {};
  return { ok: !!r?.ok, data };
}

export default function KidModeCard({ kids, zh, onKidsChanged }: { kids: AccountKid[]; zh: boolean; onKidsChanged: () => void }) {
  const teens = kids.filter((k) => k.age >= TEEN_MIN_AGE);
  return (
    <>
      {KID_MODE_ENABLED && <PinAndStart kids={kids} zh={zh} />}
      {teens.length > 0 && <TeenLinks teens={teens} zh={zh} onChanged={onKidsChanged} />}
    </>
  );
}

// ── Parent PIN + Start Kid Mode ───────────────────────────────────────────────

function PinAndStart({ kids, zh }: { kids: AccountKid[]; zh: boolean }) {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);
  const [starting, setStarting] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    call("/api/guardian-pin", "GET").then((r) => setHasPin(r.ok ? !!r.data.has_pin : false));
  }, []);
  useEffect(load, [load]);

  async function start(kid: AccountKid) {
    setErr(null);
    setStarting(kid.id);
    const r = await startKidMode(kid.id);
    if (r.url) { window.location.assign(r.url); return; }
    setStarting(null);
    setErr(pinErrorText({ detail: r.error ?? "failed" }, zh));
  }

  return (
    <section className={card}>
      <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2">
        <KeyRound size={16} className="text-indigo-600" /> {zh ? "兒童模式" : "Kid Mode"}
      </h2>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {zh
          ? "把裝置交給孩子下棋。兒童模式下不能購買、使用寶石或更改帳戶，離開時需要家長 PIN。"
          : "Hand this device to your child to play chess. In Kid Mode nothing can be bought, no gems can be spent and the account can't be changed. Leaving needs your parent PIN."}
      </p>

      {hasPin === null ? (
        <Loader2 className="mt-4 animate-spin text-gray-300" size={18} />
      ) : !hasPin || editing ? (
        <PinForm zh={zh} changing={!!hasPin} onCancel={hasPin ? () => setEditing(false) : undefined}
          onSaved={() => { setEditing(false); setHasPin(true); }} />
      ) : (
        <>
          <p className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
              <Check size={15} className="text-emerald-600" /> {zh ? "家長 PIN 已設定" : "Parent PIN is set"}
            </span>
            <button type="button" onClick={() => setEditing(true)} className="text-xs font-bold text-indigo-600">
              {zh ? "變更 / 忘記 PIN" : "Change or reset PIN"}
            </button>
          </p>
          {kids.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">{zh ? "先新增孩子，才能開始兒童模式。" : "Add a child first to start Kid Mode."}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {kids.map((k) => (
                <li key={k.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm font-bold text-gray-900">{k.first_name} <span className="text-xs font-normal text-gray-500">· {k.age}</span></span>
                  <button type="button" onClick={() => start(k)} disabled={starting !== null}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                    {starting === k.id ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    {zh ? "開始兒童模式" : "Start Kid Mode"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {err && <p role="alert" className="mt-3 text-xs text-red-600">{err}</p>}
    </section>
  );
}

function PinForm({ zh, changing, onSaved, onCancel }: { zh: boolean; changing: boolean; onSaved: () => void; onCancel?: () => void }) {
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pin !== again) { setErr(zh ? "兩次輸入的 PIN 不一樣。" : "The two PINs don't match."); return; }
    setBusy(true);
    setErr(null);
    const body: Record<string, string> = { pin };
    if (changing) Object.assign(body, forgot ? { password } : { current_pin: current });
    const r = await call("/api/guardian-pin", "POST", body);
    setBusy(false);
    if (r.ok) { onSaved(); return; }
    setErr(pinErrorText(r.data as PinFailure, zh));
  }

  const pinProps = { type: "password", inputMode: "numeric" as const, autoComplete: "off", pattern: "[0-9]{4,6}", maxLength: 6, required: true, className: input };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
      {changing && !forgot && (
        <label className="text-xs font-semibold text-gray-700">
          {zh ? "目前的 PIN" : "Current PIN"}
          <input {...pinProps} value={current} onChange={(e) => setCurrent(digits(e.target.value))} />
        </label>
      )}
      {changing && forgot && (
        <label className="text-xs font-semibold text-gray-700">
          {zh ? "帳戶密碼" : "Account password"}
          <input type="password" autoComplete="current-password" required className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      )}
      <label className="text-xs font-semibold text-gray-700">
        {changing ? (zh ? "新的 PIN（4–6 位數字）" : "New PIN (4–6 digits)") : (zh ? "設定家長 PIN（4–6 位數字）" : "Choose a parent PIN (4–6 digits)")}
        <input {...pinProps} value={pin} onChange={(e) => setPin(digits(e.target.value))} />
      </label>
      <label className="text-xs font-semibold text-gray-700">
        {zh ? "再輸入一次" : "Type it again"}
        <input {...pinProps} value={again} onChange={(e) => setAgain(digits(e.target.value))} />
      </label>
      {changing && (
        <button type="button" onClick={() => { setForgot((f) => !f); setErr(null); }} className="self-start text-xs font-bold text-indigo-600">
          {forgot ? (zh ? "我記得 PIN" : "I remember my PIN") : (zh ? "忘記 PIN？改用帳戶密碼" : "Forgot the PIN? Use your account password")}
        </button>
      )}
      {changing && forgot && (
        <p className="text-xs text-gray-500">
          {zh ? "用 LINE 登入、沒有密碼？請用 LINE 聯絡我們，我們會幫您重設。" : "Signed in with LINE and have no password? Message us on LINE and we'll reset it for you."}
        </p>
      )}
      {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "…" : zh ? "儲存 PIN" : "Save PIN"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700">
            {zh ? "取消" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );
}

// ── Linking a teen's own account ──────────────────────────────────────────────

function TeenLinks({ teens, zh, onChanged }: { teens: AccountKid[]; zh: boolean; onChanged: () => void }) {
  const [links, setLinks] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function make(k: AccountKid) {
    setBusy(k.id);
    setErr(null);
    const r = await call(`/api/students/${k.id}/link-invite`, "POST");
    setBusy(null);
    if (r.ok && r.data.url) { setLinks((l) => ({ ...l, [k.id]: r.data.url })); return; }
    if (r.data.detail === "already_linked") { onChanged(); return; }
    setErr(zh ? "無法建立連結，請再試一次。" : "Couldn't make the link. Please try again.");
  }

  async function unlink(k: AccountKid) {
    setBusy(k.id);
    setErr(null);
    const r = await call(`/api/students/${k.id}/link`, "DELETE");
    setBusy(null);
    if (r.ok) onChanged();
    else setErr(zh ? "無法取消連結，請再試一次。" : "Couldn't unlink. Please try again.");
  }

  async function copy(id: number) {
    try {
      await navigator.clipboard.writeText(links[id]);
      setCopied(id);
    } catch { /* the link stays selectable */ }
  }

  return (
    <section className={card}>
      <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2">
        <Link2 size={16} className="text-indigo-600" /> {zh ? "13–17 歲：連結孩子自己的帳戶" : "Ages 13–17: link their own account"}
      </h2>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {zh
          ? "青少年可以用自己的 Artecks 帳戶下棋。連結後，他們賺到的寶石會進入您的家庭寶石，可折抵套票。"
          : "Teens can play with their own Artecks account. Once linked, the gems they earn go into your family gems and count toward package discounts."}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {teens.map((k) => (
          <li key={k.id} className="rounded-2xl bg-gray-50 px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-gray-900">{k.first_name} <span className="text-xs font-normal text-gray-500">· {k.age}</span></span>
              {k.linked ? (
                <span className="inline-flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><Check size={13} /> {zh ? "已連結" : "Linked"}</span>
                  <button type="button" onClick={() => unlink(k)} disabled={busy === k.id} className="font-bold text-gray-500 hover:text-red-600">
                    {zh ? "取消連結" : "Unlink"}
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => make(k)} disabled={busy === k.id}
                  className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 disabled:opacity-60">
                  {busy === k.id ? "…" : links[k.id] ? (zh ? "重新產生連結" : "Make a new link") : (zh ? "產生邀請連結" : "Make an invite link")}
                </button>
              )}
            </div>
            {!k.linked && links[k.id] && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input readOnly value={links[k.id]} onFocus={(e) => e.target.select()} aria-label={zh ? "邀請連結" : "Invite link"}
                    className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700" />
                  <button type="button" onClick={() => copy(k.id)} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">
                    <Copy size={13} /> {copied === k.id ? (zh ? "已複製" : "Copied") : (zh ? "複製" : "Copy")}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {zh ? `把連結傳給 ${k.first_name}，請他們用自己的帳戶登入後開啟。連結 7 天內有效，只能使用一次。` : `Send this to ${k.first_name} and ask them to open it while logged in to their own account. It works once, for 7 days.`}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
      {err && <p role="alert" className="mt-3 text-xs text-red-600">{err}</p>}
    </section>
  );
}
