"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type Step = "form" | "check-email";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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
      errs[key] = Array.isArray(val) ? (val as string[])[0] : String(val);
    }
    setError(errs);
  }

  if (step === "check-email") {
    return (
      <div className="min-h-screen bg-[#0f0d2a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-indigo-300 font-semibold text-sm mb-6">{registeredEmail}</p>
          <p className="text-white/40 text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account, then come back here to sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-sm"
          >
            Go to sign in
          </Link>
          <p className="text-white/30 text-xs mt-6">
            Didn&apos;t get it? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0d2a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Artecks" className="h-10 w-auto mx-auto mb-4 invert" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Join Artecks Academy today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error.detail && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error.detail}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              />
              {error.first_name && <p className="text-red-400 text-xs mt-1">{error.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              />
              {error.last_name && <p className="text-red-400 text-xs mt-1">{error.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="janedoe"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {error.username && <p className="text-red-400 text-xs mt-1">{error.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {error.email && <p className="text-red-400 text-xs mt-1">{error.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {error.password && <p className="text-red-400 text-xs mt-1">{error.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
