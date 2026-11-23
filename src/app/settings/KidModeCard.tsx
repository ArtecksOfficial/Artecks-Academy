"use client";
// ─── Kids' logins: each child gets a login for their own device; teen links ──
//
// Owner decision (Nov 2026): no parent PIN / "Start Kid Mode" on the parent's
// device. Instead the parent gives each child a username + password; the child
// signs in at /kid on their own tablet or phone and plays in Kid Mode.
// Linking a 13–17-year-old's own full account is still available.

import { useState, FormEvent } from "react";
import { Check, Copy, KeyRound, Link2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";

export interface AccountKid { id: number; first_name: string; age: number; linked?: boolean; kid_login?: string | null }

const card = "rounded-2xl bg-white border border-[#E2DDD2] p-5 sm:p-6 shadow-sm";
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A]";
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
      {kids.length > 0 && <KidLogins kids={kids} zh={zh} onChanged={onKidsChanged} />}
      {teens.length > 0 && <TeenLinks teens={teens} zh={zh} onChanged={onKidsChanged} />}
    </>
  );
}

// ── Kid logins (for the child's own device) ──────────────────────────────────

const KID_LOGIN_URL = "academy.artecks.com/kid";

function KidLogins({ kids, zh, onChanged }: { kids: AccountKid[]; zh: boolean; onChanged: () => void }) {
  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 text-base font-black text-gray-900"><KeyRound size={16} className="text-[#A07C34]" /> {zh ? "孩子的登入帳號" : "Kids' logins"}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {zh
          ? <>給孩子一組帳號密碼，讓他們在自己的平板或手機上下棋。孩子到 <b>{KID_LOGIN_URL}</b> 登入，不能購買東西、不能用寶石，也不能更改帳戶。</>
          : <>Give each child a username and password to play chess on their own tablet or phone. They log in at <b>{KID_LOGIN_URL}</b>. They can&apos;t buy anything, spend gems or change the account.</>}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {kids.map((k) => <KidLoginRow key={k.id} kid={k} zh={zh} onChanged={onChanged} />)}
      </ul>
    </section>
  );
}

function KidLoginRow({ kid, zh, onChanged }: { kid: AccountKid; zh: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(kid.kid_login ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const errText = (code: string) => ({
    bad_username: zh ? "帳號需 3–20 個字，只能用英文小寫、數字、. 或 _。" : "Username: 3–20 characters, lowercase letters, numbers, . or _ only.",
    bad_password: zh ? "密碼至少 6 個字。" : "Password needs at least 6 characters.",
    username_taken: zh ? "這個帳號已經有人用了，換一個試試。" : "That username is taken. Try another.",
  } as Record<string, string>)[code] ?? (zh ? "無法儲存，請再試一次。" : "Couldn't save. Please try again.");

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const r = await call(`/api/students/${kid.id}/kid-login`, "POST", { username: username.trim().toLowerCase(), password });
    setBusy(false);
    if (!r.ok) return setErr(errText(String(r.data.detail ?? "")));
    setEditing(false); setPassword(""); setSaved(true); onChanged();
  }

  async function remove() {
    if (!window.confirm(zh ? `移除 ${kid.first_name} 的登入帳號？孩子將無法再登入。` : `Remove ${kid.first_name}'s login? They won't be able to log in any more.`)) return;
    setBusy(true);
    await call(`/api/students/${kid.id}/kid-login`, "DELETE");
    setBusy(false); setSaved(false); setUsername(""); onChanged();
  }

  return (
    <li className="rounded-2xl bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-900">{kid.first_name}</span>
        {kid.kid_login && !editing ? (
          <span className="text-xs text-gray-600">{zh ? "帳號：" : "Username: "}<b className="font-mono text-gray-900">{kid.kid_login}</b></span>
        ) : !editing ? (
          <span className="text-xs text-gray-500">{zh ? "尚未建立" : "No login yet"}</span>
        ) : null}
      </div>
      {saved && !editing && (
        <p className="mt-2 text-xs font-semibold text-emerald-700">
          {zh ? `已儲存。請把帳號和密碼告訴 ${kid.first_name}，並到 ${KID_LOGIN_URL} 登入。` : `Saved. Tell ${kid.first_name} the username and password, and to log in at ${KID_LOGIN_URL}.`}
        </p>
      )}
      {editing ? (
        <form onSubmit={save} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <label className="text-xs font-semibold text-gray-600">{zh ? "帳號" : "Username"}
            <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "").slice(0, 20))}
              placeholder={kid.first_name.toLowerCase()} autoCapitalize="none" autoCorrect="off" spellCheck={false} required className={`mt-1 ${input} font-mono`} />
          </label>
          <label className="text-xs font-semibold text-gray-600">{kid.kid_login ? (zh ? "新密碼" : "New password") : (zh ? "密碼" : "Password")}
            <input value={password} onChange={(e) => setPassword(e.target.value.slice(0, 64))} minLength={6} required
              autoComplete="new-password" className={`mt-1 ${input}`} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-[#13223F] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "…" : zh ? "儲存" : "Save"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setErr(null); setUsername(kid.kid_login ?? ""); }}
              className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-bold text-gray-700">{zh ? "取消" : "Cancel"}</button>
          </div>
          <p className="sm:col-span-3 text-[11px] text-gray-500">{zh ? "密碼顯示出來方便你抄給孩子。之後無法再查看，只能重設。" : "The password is shown so you can copy it for your child. You can't see it again later, only set a new one."}</p>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setEditing(true); setSaved(false); }}
            className="rounded-xl bg-[#13223F] px-3 py-2 text-xs font-bold text-white">
            {kid.kid_login ? (zh ? "更改帳號或密碼" : "Change username or password") : (zh ? "建立登入帳號" : "Make a login")}
          </button>
          {kid.kid_login && (
            <button type="button" disabled={busy} onClick={remove} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-red-600">
              {zh ? "移除" : "Remove"}
            </button>
          )}
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    </li>
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
        <Link2 size={16} className="text-[#A07C34]" /> {zh ? "13–17 歲：連結孩子自己的帳戶" : "Ages 13–17: link their own account"}
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
                  className="rounded-xl border border-[#E7C98A] bg-white px-3 py-2 text-xs font-bold text-[#A07C34] disabled:opacity-60">
                  {busy === k.id ? "…" : links[k.id] ? (zh ? "重新產生連結" : "Make a new link") : (zh ? "產生邀請連結" : "Make an invite link")}
                </button>
              )}
            </div>
            {!k.linked && links[k.id] && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input readOnly value={links[k.id]} onFocus={(e) => e.target.select()} aria-label={zh ? "邀請連結" : "Invite link"}
                    className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700" />
                  <button type="button" onClick={() => copy(k.id)} className="inline-flex items-center gap-1 rounded-xl bg-[#13223F] px-3 py-2 text-xs font-bold text-white">
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
