"use client";
import { useState } from "react";
import { Phone, Loader2, ArrowLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import type { MyBooking } from "@/lib/api";

const TZ = "Asia/Taipei";
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ, weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200" },
    attended:  { label: "Attended",  cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

function BookingCard({ booking }: { booking: MyBooking }) {
  return (
    <a href={`/report/${booking.id}`}
      className="block rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-gray-900 leading-tight truncate">{booking.session_title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock size={11} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500">{fmtDateTime(booking.session_datetime)}</p>
            </div>
            {booking.location && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 truncate">{booking.location}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={booking.status} />
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </div>
        {booking.price_paid != null && (
          <p className="text-xs font-bold text-gray-700">
            NT${Number(booking.price_paid).toLocaleString()}
            {booking.discount_applied ? (
              <span className="ml-1.5 text-emerald-600 font-semibold">(member discount applied)</span>
            ) : null}
          </p>
        )}
      </div>
    </a>
  );
}

export default function MyBookingsPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<MyBooking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) { setError("Please enter your phone number."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/my-bookings?phone=${encodeURIComponent(trimmed)}`);
      if (!res.ok) { setError("Could not find bookings for that number."); setBookings(null); return; }
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={13} />
            Home
          </a>
          <div className="w-px h-4 bg-gray-200" />
          <p className="text-sm font-black text-gray-900">My Bookings</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Lookup form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Phone size={15} className="text-indigo-500" />
            <p className="font-black text-sm text-gray-900">Look up your sessions</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">Enter the phone number you used when booking.</p>
          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="tel"
              placeholder="+886 9xx xxx xxx"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
            </button>
          </form>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* Results */}
        {bookings !== null && (
          bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-semibold">No bookings found</p>
              <p className="text-xs mt-1">Try the phone number you used when booking.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
              {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
