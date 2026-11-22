"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth-client";
import { startLineLink } from "@/lib/line-login";

// Coaches get a LINE message for every lesson booked with them once LINE is
// connected here and they've added the Artecks Academy LINE account.
export default function LineAlertsCard({ zh, next = "/coach?tab=profile", onStatus }: { zh: boolean; next?: string; onStatus?: (on: boolean) => void }) {
  const [st, setSt] = useState<{ linked: boolean; is_friend?: boolean; display_name?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/line", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { linked: false }))
      .then((d) => { setSt(d); onStatus?.(!!d.linked && d.is_friend !== false); })
      .catch(() => setSt({ linked: false }));
  }, [onStatus]);
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
        <button type="button" onClick={async () => setErr(await startLineLink(next, authHeaders()))}
          className="self-start rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-5 py-2.5 text-sm">
          {zh ? "連結 LINE" : "Connect LINE"}
        </button>
      )}
      {err && <p role="alert" className="text-xs text-red-500">{err}</p>}
    </div>
  );
}
