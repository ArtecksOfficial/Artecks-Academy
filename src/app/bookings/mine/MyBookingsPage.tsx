"use client";
import SiteHeader from "@/app/components/SiteHeader";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Phone, Loader2, ArrowLeft, ChevronRight, Clock, MapPin, Star } from "lucide-react";
import type { MyBooking } from "@/lib/api";

const TZ = "Asia/Taipei";
function fmtDateTime(iso: string, zh = false) {
  return new Date(iso).toLocaleString(zh ? "zh-TW" : "en-US", {
    timeZone: TZ, weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function StatusBadge({ status }: { status: string }) {
  const zh = useLanguage().locale === "zh";
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: zh ? "已確認" : "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending:   { label: zh ? "待確認" : "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
    cancelled: { label: zh ? "已取消" : "Cancelled", cls: "bg-red-50 text-red-600 border-red-200" },
    attended:  { label: zh ? "已上課" : "Attended",  cls: "bg-[#FBF5E8] text-[#A07C34] border-[#E7C98A]" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

function payPath(url: string): string {
  // Keep the parent on this site, whatever host the backend put in the link.
  try { const u = new URL(url); return u.pathname + u.search; } catch { return url; }
}

/** One tap rates the lesson. Saved straight away; a comment is optional on the full page. */
function RateLesson({ booking }: { booking: MyBooking }) {
  const zh = useLanguage().locale === "zh";
  const [mine, setMine] = useState<number | null>(booking.my_rating ?? null);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gems, setGems] = useState(0);
  if (!mine && !booking.rate_url) return null;

  async function rate(n: number) {
    if (!booking.rate_url || saving) return;
    setSaving(true); setFailed(false);
    try {
      const token = new URL(booking.rate_url).searchParams.get("t") ?? "";
      const r = await fetch(`/api/feedback/${booking.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ t: token, rating: n }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error();
      setMine(n); setGems(d.gems_credited ?? 0);
    } catch { setFailed(true); } finally { setSaving(false); }
  }

  const shown = hover || mine || 0;
  return (
    <div className="px-4 pb-4 -mt-1">
      <div className="rounded-xl bg-[#FBF5E8] border border-[#E7C98A] px-3 py-2.5 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#13223F]">
          {mine ? (zh ? "你的評分" : "Your rating") : (zh ? "這堂課怎麼樣？" : "How was this lesson?")}
          {gems > 0 && <span className="ml-1.5 text-[#A07C34]">+{gems} {zh ? "寶石" : "gems"}</span>}
          {failed && <span className="ml-1.5 text-red-600">{zh ? "沒有存到，請再試一次" : "Not saved. Try again"}</span>}
        </p>
        <div className="flex" role="radiogroup" aria-label={zh ? "評分 1 到 5 顆星" : "Rate 1 to 5 stars"} onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={mine === n} aria-label={zh ? `${n} 顆星` : `${n} star${n > 1 ? "s" : ""}`}
              disabled={!!mine || saving} onClick={() => rate(n)} onMouseEnter={() => !mine && setHover(n)}
              className="p-1 disabled:cursor-default">
              <Star size={22} className={n <= shown ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: MyBooking }) {
  const zh = useLanguage().locale === "zh";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white hover:border-[#C49A4A] hover:shadow-sm transition-all overflow-hidden">
    <a href={`/report/${booking.id}`} className="block">
      
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-gray-900 leading-tight truncate">{booking.session_title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock size={11} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500">{fmtDateTime(booking.session_start, zh)}</p>
            </div>
            {(booking.location_name) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 truncate">{booking.location_name}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={booking.status} />
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </div>
        {Number(booking.price_twd) > 0 && (
          <p className="text-xs font-bold text-gray-700">
            NT${Number(booking.price_twd).toLocaleString()}
            {booking.applied_discount_amount > 0 ? (
              <span className="ml-1.5 text-emerald-600 font-semibold">{zh ? "（已套用會員折扣）" : "(member discount applied)"}</span>
            ) : null}
            {(booking.gem_discount_twd ?? 0) > 0 ? (
              <span className="ml-1.5 text-[#A07C34] font-semibold">{zh ? `（${booking.gems_used} 顆寶石折抵 NT$${booking.gem_discount_twd}）` : `(−NT$${booking.gem_discount_twd} with ${booking.gems_used} gems)`}</span>
            ) : null}
          </p>
        )}
      </div>
    </a>
    {booking.pay_url && Number(booking.price_twd) > 0 && (
      <div className="px-4 pb-4 -mt-1">
        <a href={payPath(booking.pay_url)}
          className="flex items-center justify-center w-full rounded-xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold py-2.5">
          {zh ? "付款" : "Pay"} · NT${Number(booking.price_twd).toLocaleString()}
        </a>
      </div>
    )}
    <RateLesson booking={booking} />
    </div>
  );
}

export default function MyBookingsPage() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [student, setStudent] = useState("");
  const [bookings, setBookings] = useState<MyBooking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signed in: show this account's lessons straight away (no phone lookup).
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/my-bookings", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setBookings(Array.isArray(d) ? d : (d.bookings ?? [])))
      .catch(() => setError(zh ? "目前無法載入課程。" : "We couldn't load your lessons right now."))
      .finally(() => setLoading(false));
  }, [user, zh]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed || !student.trim()) { setError(zh ? "請輸入電話號碼和孩子的名字。" : "Enter your phone number and your child's name."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/my-bookings?phone=${encodeURIComponent(trimmed)}&student=${encodeURIComponent(student.trim())}`);
      if (!res.ok) { setError(zh ? "找不到符合的預約。" : "Could not find bookings for that phone number and name."); setBookings(null); return; }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : (data.bookings ?? []));
    } catch {
      setError(zh ? "發生錯誤，請再試一次。" : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const now = Date.now();
  const upcoming = (bookings ?? []).filter((b) => b.status !== "cancelled" && new Date(b.session_start).getTime() >= now - 3600_000)
    .sort((a, b) => a.session_start.localeCompare(b.session_start));
  const past = (bookings ?? []).filter((b) => !upcoming.includes(b));

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{zh ? "我的課程" : "My lessons"}</h1>
            <p className="mt-1 text-sm text-[#5B6478]">{zh ? "即將到來與過去的課程、付款和課後報告。" : "Upcoming and past lessons, payments and lesson reports."}</p>
          </div>
          <Link href="/book" className="rounded-xl bg-[#C49A4A] px-4 py-2.5 text-sm font-bold text-[#0E1E3A] hover:bg-[#D4AE63]">
            {zh ? "預約課程" : "Book a lesson"}
          </Link>
        </div>

        {isLoading ? <Loader2 className="animate-spin text-gray-300" /> : !user && (
          <div className="max-w-xl bg-white rounded-3xl border border-[#E2DDD2] p-6">
            <div className="flex items-center gap-2 mb-1">
              <Phone size={15} className="text-[#A07C34]" />
              <p className="font-black text-sm text-[#13223F]">{zh ? "查詢你的課程" : "Look up your lessons"}</p>
            </div>
            <p className="text-xs text-[#5B6478] mb-4">
              {zh ? "輸入預約時使用的電話號碼和孩子的名字，或" : "Enter the phone number and child's name you used when booking, or "}
              <Link href="/login?next=/bookings/mine" className="font-bold text-[#A07C34]">{zh ? "登入" : "log in"}</Link>
              {zh ? "直接查看。" : " to see them straight away."}
            </p>
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
              <input type="tel" aria-label={zh ? "電話號碼" : "Phone number"} placeholder="+886 9xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E7C98A]" />
              <input type="text" aria-label={zh ? "孩子的名字" : "Child's name"} placeholder={zh ? "孩子的名字" : "Child's name"} value={student} onChange={(e) => setStudent(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E7C98A]" />
              <button type="submit" disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-[#13223F] hover:bg-[#1C3157] disabled:opacity-50 text-white text-sm font-bold flex items-center gap-1.5">
                {loading ? <Loader2 size={14} className="animate-spin" /> : (zh ? "查詢" : "Search")}
              </button>
            </form>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {user && loading && <Loader2 className="animate-spin text-gray-300" />}

        {bookings !== null && (bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E2DDD2] bg-white/60 p-8 text-center">
            <p className="text-sm font-bold text-[#13223F]">{zh ? "還沒有課程" : "No lessons yet"}</p>
            <p className="mt-1 text-sm text-[#5B6478]">{zh ? "預約第一堂課後就會出現在這裡。" : "Your lessons appear here once you book the first one."}</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-black text-[#13223F]">{zh ? `即將到來（${upcoming.length}）` : `Upcoming (${upcoming.length})`}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
              </section>
            )}
            {past.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-black text-[#13223F]">{zh ? `過去的課程（${past.length}）` : `Past lessons (${past.length})`}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{past.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
              </section>
            )}
          </>
        ))}
      </main>
    </div>
  );
}
