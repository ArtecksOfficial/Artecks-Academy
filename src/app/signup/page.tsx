"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import LegalLinks from "@/app/components/LegalLinks";
import LineLoginButton from "@/app/components/LineLoginButton";
import GoogleLoginButton, { GoogleProvider } from "@/app/components/GoogleLoginButton";
import { saveAuth } from "@/lib/auth-client";
import { IS_NATIVE_BUILD } from "@/lib/platform";

type Step = "form" | "check-email";

const AGE_GATE_KEY = "artecks_age_gate";

const FIELD_MESSAGES: Record<string, { en: string; zh: string }> = {
  birth_year_required: { en: "Please choose your birth year.", zh: "請選擇出生年份。" },
  birth_year_invalid: { en: "Please choose a valid birth year.", zh: "請選擇正確的出生年份。" },
  guardian_consent_required: { en: "A parent or guardian needs to agree before you can create an account.", zh: "需要家長或監護人同意才能建立帳號。" },
};

export default function SignupPage() {
  const zh = useLanguage().locale === "zh";
  const [step, setStep] = useState<Step>("form");
  // Keep ?next= (e.g. /teach) so signing in afterwards returns there.
  const [loginHref, setLoginHref] = useState("/login");
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next") ?? "";
    if (next.startsWith("/") && !next.startsWith("//")) setLoginHref(`/login?next=${encodeURIComponent(next)}`);
  }, []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // LINE is the main way in; the email form stays tucked away until asked for.
  // The iOS app hides LINE, so there the form starts open.
  const [showEmail, setShowEmail] = useState(IS_NATIVE_BUILD);
  const [registeredEmail, setRegisteredEmail] = useState("");
  // Age gate: everyone is asked their birth year, with no hint about which
  // answers are allowed. Under 13 cannot make an account (a parent adds them
  // as a kid profile); 13–17 need the guardian-consent box.
  const [birthYear, setBirthYear] = useState("");
  const [consent, setConsent] = useState(false);
  const [needsGuardian, setNeedsGuardian] = useState(false);
  const thisYear = new Date().getFullYear();
  const age = birthYear ? thisYear - Number(birthYear) : null;
  const isTeen = age !== null && age >= 13 && age < 18;

  useEffect(() => {
    // Once blocked, changing the year and trying again in the same visit is not offered.
    try { if (sessionStorage.getItem(AGE_GATE_KEY)) setNeedsGuardian(true); } catch {}
  }, []);

  function nextPath() {
    const next = new URLSearchParams(window.location.search).get("next") ?? "";
    return next.startsWith("/") && !next.startsWith("//") ? next : "/";
  }

  async function handleGoogle(accessToken: string) {
    setError({});
    setLoading(true);
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && d.access && d.refresh && d.user) {
      saveAuth(d.access, d.refresh, d.user);
      window.location.assign(nextPath());
      return;
    }
    setLoading(false);
    setError({ detail: d.detail || (zh ? "Google 註冊失敗，請再試一次。" : "Google sign-up didn't work. Please try again.") });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        birth_year: Number(birthYear),
        guardian_consent: isTeen && consent,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok || res.status === 201) {
      setRegisteredEmail(email);
      setStep("check-email");
      return;
    }

    // Map Django validation errors
    const errs: Record<string, string> = {};
    for (const [key, val] of Object.entries(data)) {
      const msg = Array.isArray(val) ? (val as string[])[0] : String(val);
      errs[key] = FIELD_MESSAGES[msg] ? FIELD_MESSAGES[msg][zh ? "zh" : "en"] : msg;
    }
    if (errs.birth_year === "guardian_account_required") {
      try { sessionStorage.setItem(AGE_GATE_KEY, "1"); } catch {}
      setNeedsGuardian(true);
      return;
    }
    setError(errs);
  }

  if (needsGuardian) {
    return (
      <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white mb-3">{zh ? "請找家長或監護人" : "Ask a parent or guardian"}</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            {zh ? "我們無法建立這個帳號。請家長或監護人註冊，並把你加入他們的帳號，就可以從那裡開始玩。"
                : "We can\u2019t create this account. A parent or guardian can sign up and add you to their account, and then you can play from there."}
          </p>
          <Link
            href="/"
            className="inline-block bg-[#C49A4A] hover:bg-[#D4AE63] text-[#0E1E3A] font-bold font-semibold py-3 px-8 rounded-xl transition-colors text-sm"
          >
            {zh ? "回到 Artecks 學院" : "Back to Artecks Academy"}
          </Link>
        </div>
      </div>
    );
  }

  if (step === "check-email") {
    return (
      <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-2xl font-bold text-white mb-3">{zh ? "請查看收件匣" : "Check your inbox"}</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            {zh ? "我們已寄出驗證連結到" : "We sent a verification link to"}
          </p>
          <p className="text-[#E7C98A] font-semibold text-sm mb-6">{registeredEmail}</p>
          <p className="text-white/40 text-xs leading-relaxed mb-8">
            {zh ? "點開信中的連結啟用帳號，再回來這裡登入。" : "Click the link in the email to activate your account, then come back here to sign in."}
          </p>
          <Link
            href={loginHref}
            className="inline-block bg-[#C49A4A] hover:bg-[#D4AE63] text-[#0E1E3A] font-bold font-semibold py-3 px-8 rounded-xl transition-colors text-sm"
          >
            {zh ? "前往登入" : "Go to sign in"}
          </Link>
          <p className="text-white/30 text-xs mt-6">
            {zh ? "沒收到嗎？請查看垃圾信件匣。" : "Didn\u2019t get it? Check your spam folder."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Artecks" className="h-10 w-auto mx-auto mb-4 invert" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{zh ? "建立帳號" : "Create your account"}</h1>
          <p className="text-white/50 text-sm mt-1">{zh ? "今天就加入 Artecks 學院" : "Join Artecks Academy today"}</p>
        </div>

        {error.detail && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {error.detail}
          </div>
        )}

        <div className="space-y-3">
          <LineLoginButton large label={zh ? "使用 LINE 註冊" : "Sign up with LINE"} />
          <GoogleProvider>
            <GoogleLoginButton onToken={handleGoogle} onError={(m) => setError({ detail: m })} />
          </GoogleProvider>
        </div>
        <p className="text-center text-xs text-white/40 mt-3">{zh ? "適用於家長與成人學員。孩子的登入帳號由家長在「設定」中建立。" : "For parents and adult learners. Kids get their login from a parent in Settings."}</p>

        <div className="flex items-center gap-3 my-5 text-xs text-white/30">
          <span className="flex-1 h-px bg-white/10" /> {zh ? "或" : "or"} <span className="flex-1 h-px bg-white/10" />
        </div>

        {!showEmail ? (
          <button
            type="button"
            onClick={() => setShowEmail(true)}
            aria-expanded={false}
            className="w-full border border-white/15 hover:border-white/30 text-white/80 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {zh ? "使用電子郵件註冊" : "Sign up with email"}
          </button>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "名字" : "First name"}</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
              />
              {error.first_name && <p className="text-red-400 text-xs mt-1">{error.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "姓氏" : "Last name"}</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
              />
              {error.last_name && <p className="text-red-400 text-xs mt-1">{error.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "使用者名稱" : "Username"}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="janedoe"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
            />
            {error.username && <p className="text-red-400 text-xs mt-1">{error.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "電子郵件" : "Email"}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
            />
            {error.email && <p className="text-red-400 text-xs mt-1">{error.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "密碼" : "Password"}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
            />
            {error.password && <p className="text-red-400 text-xs mt-1">{error.password}</p>}
          </div>

          <div>
            <label htmlFor="birth-year" className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "出生年份" : "Birth year"}</label>
            <select
              id="birth-year"
              required
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
            >
              <option value="" className="text-gray-900">{zh ? "選擇年份" : "Select year"}</option>
              {Array.from({ length: 100 }, (_, i) => thisYear - i).map((y) => (
                <option key={y} value={y} className="text-gray-900">{y}</option>
              ))}
            </select>
            {error.birth_year && <p className="text-red-400 text-xs mt-1">{error.birth_year}</p>}
          </div>

          {isTeen && (
            <div>
              <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#13223F]"
                />
                <span>{zh ? "我的家長或監護人知道並同意我建立這個帳號。" : "My parent or guardian knows about this account and agrees to me creating it."}</span>
              </label>
              {error.guardian_consent && <p className="text-red-400 text-xs mt-1">{error.guardian_consent}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C49A4A] hover:bg-[#D4AE63] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E1E3A] font-bold font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? (zh ? "建立中…" : "Creating account…") : (zh ? "建立帳號" : "Create account")}
          </button>
        </form>
        )}

        <p className="text-center mt-4"><LegalLinks className="justify-center text-xs text-white/40" /></p>

        <p className="text-center text-sm text-white/40 mt-6">
          {zh ? "已經有帳號了？" : "Already have an account?"}{" "}
          <Link href={loginHref} className="text-[#E7C98A] hover:text-[#F3DFAE] font-medium transition-colors">
            {zh ? "登入" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
