import { createServerClient } from "@/lib/supabase";
import type { Session } from "@/lib/types";
import { SeedButton } from "./SeedButton";
import { BookOpen, ShieldCheck, Clock, MapPin } from "lucide-react";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month:    "short",
    day:      "numeric",
    weekday:  "short",
    hour:     "2-digit",
    minute:   "2-digit",
  });
}

function SessionCard({ session }: { session: Session }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              session.status === "open"
                ? "bg-emerald-900 text-emerald-300"
                : session.status === "full"
                ? "bg-amber-900 text-amber-300"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {session.status === "open" ? "開放報名" : session.status === "full" ? "已額滿" : "已結束"}
          </span>
          <span className="text-xs text-slate-500">{session.age_group}</span>
        </div>
        <h2 className="text-base font-bold text-slate-100 leading-snug">{session.title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{session.topic}</p>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{formatTime(session.start_time)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} />
          <span>{session.location_name}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={`/session/${session.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <BookOpen size={14} />
          公開報名頁
        </a>
        <a
          href={`/coach/session/${session.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 px-3 py-2.5 text-sm font-semibold text-slate-200 transition-colors"
        >
          <ShieldCheck size={14} />
          教練後台
        </a>
      </div>
    </div>
  );
}

export default async function DevIndexPage() {
  const supabase = createServerClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(5);

  const hasSessions = sessions && sessions.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="text-sm font-bold text-slate-300">Artecks Academy</span>
          </div>
          <h1 className="text-2xl font-black text-white">Dev Launcher</h1>
          <p className="text-sm text-slate-500 mt-1">
            academy.artecks.com ·{" "}
            {hasSessions
              ? `${sessions.length} 筆課程`
              : "尚無課程資料"}
          </p>
        </div>

        {hasSessions ? (
          <>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
            <SeedButton label="再建立一筆測試課程" />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
              🏫
            </div>
            <div>
              <p className="font-bold text-slate-200">還沒有課程</p>
              <p className="text-sm text-slate-500 mt-1">建立一筆測試資料來預覽所有頁面</p>
            </div>
            <SeedButton label="建立測試課程 (Linkou)" />
          </div>
        )}

        <p className="text-center text-xs text-slate-700">
          僅限開發環境使用 · 請勿部署至正式環境
        </p>
      </div>
    </div>
  );
}
