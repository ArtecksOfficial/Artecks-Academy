"use client";
// LINE sends the parent back here with ?code&state. We finish the sign-in on
// the backend, store the Artecks tokens, then continue where they started.

import L from "@/app/components/L";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveAuth } from "@/lib/auth-client";
import { safeNext } from "@/lib/line-login";

export default function LineCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const q = new URLSearchParams(window.location.search);
    const code = q.get("code");
    const state = q.get("state");
    if (!code || !state) {
      setError(q.get("error_description") || "LINE sign-in was cancelled.");
      return;
    }
    fetch("/api/auth/line/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    })
      .then(async (r) => ({ ok: r.ok, d: await r.json().catch(() => ({})) }))
      .then(({ ok, d }) => {
        if (ok && d.result === "linked") {
          window.location.replace(safeNext(d.next, "/account"));
        } else if (ok && d.access && d.refresh && d.user) {
          saveAuth(d.access, d.refresh, d.user);
          window.location.replace(safeNext(d.next, "/packages"));
        } else {
          setError(d.detail || "line_failed");
        }
      })
      .catch(() => setError("line_failed"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F6F4EF" }}>
      <div className="max-w-sm w-full rounded-3xl bg-white border border-gray-200 p-8 text-center shadow-sm">
        {error ? (
          <>
            <p className="text-sm text-gray-800">{error === "line_failed" ? <L en="Could not sign in with LINE. Please try again." zh="無法使用 LINE 登入，請再試一次。" /> : error}</p>
            <div className="flex justify-center gap-4 mt-5 text-sm font-bold">
              <Link href="/login" className="text-[#A07C34]"><L en="Log in" zh="登入" /></Link>
              <Link href="/signup" className="text-[#A07C34]"><L en="Sign up with email" zh="用電子郵件註冊" /></Link>
            </div>
          </>
        ) : (
          <Loader2 className="animate-spin mx-auto text-gray-400" size={28} />
        )}
      </div>
    </div>
  );
}
