"use client";

import { useState, useTransition } from "react";
import { X, Phone, ChevronRight, Clock, MapPin, Star } from "lucide-react";
import type { MyBooking } from "@/lib/api";

const TZ = "Asia/Taipei";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        paid
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {paid ? "✓ Paid" : "⏳ Pending payment"}
    </span>
  );
}

function BookingCard({ booking }: { booking: MyBooking }) {
  const hasRewards = (booking.xp_awarded ?? 0) > 0 || (booking.coins_awarded ?? 0) > 0;
  return (
    <a
      href={`/report/${booking.id}`}
      className="block rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all overflow-hidden group"
    >
      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
      <div className="p-4 flex flex-col gap-2.5">
        {/* Title + arrow */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black text-gray-900 leading-snug">
            {booking.session_title}
          </h3>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 mt-0.5 flex-shrink-0 transition-colors" />
        </div>

        {/* Student */}
        <p className="text-xs text-gray-500">
          Student: <span className="font-semibold text-gray-700">{booking.student_name}</span>
        </p>

        {/* Date + location */}
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock size={10} className="text-indigo-300" />
            {fmtDateTime(booking.session_start)}
          </span>
          {booking.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin size={10} className="text-indigo-300" />
              {booking.location_name}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={booking.status} />
          <PaymentBadge status={booking.payment_status} />
        </div>

        {/* Rewards */}
        {hasRewards && (
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 text-xs font-bold text-violet-700">
            <Star size={11} className="text-amber-400" fill="currentColor" />
            <span>+{booking.xp_awarded} XP</span>
            <span>+{booking.coins_awarded} coins</span>
          </div>
        )}

        {/* Price */}
        <p className="text-xs text-gray-400 text-right font-medium">
          NT${(booking.price_twd ?? 0).toLocaleString()}
        </p>
      </div>
    </a>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export default function UserBookingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<MyBooking[] | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBookings(null);
    const trimmed = phone.trim();
    if (!trimmed) { setError("Please enter your phone number."); return; }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/my-bookings?phone=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) throw new Error("lookup failed");
        const data: MyBooking[] = await res.json();
        setBookings(data);
        if (data.length === 0) setError("No bookings found for this number.");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  const totalXP = bookings?.reduce((s, b) => s + (b.xp_awarded ?? 0), 0) ?? 0;
  const totalCoins = bookings?.reduce((s, b) => s + (b.coins_awarded ?? 0), 0) ?? 0;
  const hasArtecks = bookings?.some((b) => b.artecks_account_id);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p
              className="text-base font-black text-gray-900"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              My Bookings
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Enter your phone to look up sessions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Phone form */}
        <div className="px-5 py-4 border-b border-gray-100">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Phone
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                placeholder="e.g. 0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#4F46E5" }}
            >
              {isPending ? "…" : "Look up"}
            </button>
          </form>
          {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {bookings === null && !isPending && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">♟</div>
              <p className="text-sm font-semibold text-gray-500">Look up your sessions</p>
              <p className="text-xs mt-1 leading-relaxed">
                Enter the phone number you used when booking.
              </p>
            </div>
          )}

          {bookings !== null && bookings.length > 0 && (
            <>
              {/* Rewards summary (if Artecks account linked) */}
              {hasArtecks && (totalXP > 0 || totalCoins > 0) && (
                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4 flex items-center gap-4">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <p className="text-xs font-black text-violet-800">Artecks Rewards Earned</p>
                    <p className="text-sm font-bold text-violet-700 mt-0.5">
                      {totalXP} XP &nbsp;·&nbsp; {totalCoins} coins
                    </p>
                  </div>
                </div>
              )}

              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            No account needed to book.{" "}
            <span className="text-indigo-500 font-semibold">Add your Artecks ID</span>{" "}
            when booking to earn XP &amp; coins.
          </p>
        </div>
      </div>
    </>
  );
}
