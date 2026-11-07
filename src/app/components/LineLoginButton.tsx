"use client";

import { useState } from "react";
import { startLineLogin } from "@/lib/line-login";

export default function LineLoginButton({ next, label, className = "" }: { next?: string; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(await startLineLogin(next ?? new URLSearchParams(window.location.search).get("next") ?? "/"));
          setBusy(false);
        }}
        className="w-full rounded-xl bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-60 text-white font-bold py-3 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
          <path d="M12 3C6.48 3 2 6.58 2 11c0 3.95 3.55 7.26 8.35 7.89.33.07.77.22.88.5.1.25.07.65.03.9l-.14.86c-.04.25-.2 1 .87.55 1.08-.46 5.8-3.42 7.92-5.85C21.37 14.23 22 12.68 22 11c0-4.42-4.48-8-10-8Z" />
        </svg>
        {busy ? "…" : label}
      </button>
      {err && <p role="alert" className="text-xs text-red-500 mt-2">{err}</p>}
    </div>
  );
}
