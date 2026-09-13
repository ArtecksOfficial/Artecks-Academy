// ─── Dynamic OG Image for Session Pages ───────────────────────────────────────
// Next.js App Router file-based image generation.
// Renders a 1200×630 share card used by LINE, Facebook, Twitter, etc.
// Route: /session/[id]/opengraph-image
//
// No external fonts loaded (avoid network issues at render time).
// Pure HTML/CSS via ImageResponse — no Tailwind.

import { ImageResponse } from "next/og";
import { fetchSession } from "@/lib/api";

export const runtime = "nodejs";
export const alt = "Artecks Academy Session";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDateTW(isoStr: string): string {
  const d = new Date(isoStr);
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Taipei",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return d.toLocaleString("zh-TW", opts);
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const session = await fetchSession(id).catch(() => null);

  // ── Fallback card when session not found ──────────────────────────────────
  if (!session) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 48, fontWeight: 700 }}>
            Artecks Academy
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const dateStr = formatDateTW(session.start_time);
  const price = session.price_twd
    ? `NT$${session.price_twd.toLocaleString()}`
    : "Free · 免費";
  const location = session.location_name ?? "TBD";
  const coachName = session.coach?.name ?? "";
  const coachNameZh = session.coach?.name_zh ?? "";
  const coachInitials =
    session.coach?.avatar_initials ||
    (coachName ? coachName.slice(0, 2).toUpperCase() : "AC");
  const coachTitle = session.coach?.title ?? "";
  const isFull = session.is_full;
  const canBook = session.booking_open && !isFull && session.status === "open";

  const statusColor = canBook ? "#22c55e" : isFull ? "#f59e0b" : "#9ca3af";
  const statusLabel = canBook ? "開放報名" : isFull ? "已額滿" : "即將開放";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Background decoration ── */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.15)",
          }}
        />

        {/* ── Top bar: brand + status ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 56px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Hex logo placeholder */}
            <div
              style={{
                width: 44,
                height: 44,
                background: "white",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5" }}>A</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              Artecks Academy
            </span>
          </div>

          {/* Status pill */}
          <div
            style={{
              background: "rgba(0,0,0,0.35)",
              border: `2px solid ${statusColor}`,
              borderRadius: 40,
              padding: "8px 22px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: statusColor,
              }}
            />
            <span style={{ color: statusColor, fontSize: 18, fontWeight: 700 }}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "32px 56px 40px",
            gap: 48,
          }}
        >
          {/* Left: session info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            {/* Title area */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {session.age_group && (
                <div
                  style={{
                    background: "rgba(99,102,241,0.5)",
                    borderRadius: 6,
                    padding: "4px 14px",
                    display: "inline-flex",
                    width: "fit-content",
                  }}
                >
                  <span style={{ color: "#c7d2fe", fontSize: 16, fontWeight: 600 }}>
                    👶 {session.age_group}
                  </span>
                </div>
              )}
              <h1
                style={{
                  margin: 0,
                  fontSize: session.title.length > 30 ? 46 : 56,
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1.15,
                  letterSpacing: -1,
                }}
              >
                {session.title}
              </h1>
              {session.topic && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    color: "rgba(199,210,254,0.85)",
                    lineHeight: 1.4,
                    maxWidth: 560,
                  }}
                >
                  {session.topic}
                </p>
              )}
            </div>

            {/* Meta grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Date */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>📅</span>
                <span style={{ color: "rgba(255,255,255,0.92)", fontSize: 22, fontWeight: 600 }}>
                  {dateStr}
                </span>
              </div>
              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>📍</span>
                <span style={{ color: "rgba(255,255,255,0.92)", fontSize: 22, fontWeight: 600 }}>
                  {location}
                </span>
              </div>
              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>💰</span>
                <span style={{ color: "#a5f3fc", fontSize: 26, fontWeight: 800 }}>
                  {price}
                </span>
              </div>
            </div>
          </div>

          {/* Right: coach card */}
          {session.coach && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                borderRadius: 24,
                padding: "36px 40px",
                width: 280,
                gap: 16,
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #818cf8, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid rgba(255,255,255,0.3)",
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 900, color: "white" }}>
                  {coachInitials}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    color: "rgba(199,210,254,0.7)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Coach · 教練
                </span>
                <span style={{ color: "white", fontSize: 24, fontWeight: 800 }}>
                  {coachName}
                </span>
                {coachNameZh && (
                  <span style={{ color: "rgba(199,210,254,0.8)", fontSize: 18, fontWeight: 600 }}>
                    {coachNameZh}
                  </span>
                )}
                {coachTitle && (
                  <span style={{ color: "#a5b4fc", fontSize: 15, fontWeight: 500, textAlign: "center" }}>
                    {coachTitle}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 56px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ color: "rgba(165,180,252,0.8)", fontSize: 16, fontWeight: 500 }}>
            🎓 林口社區小課 · Linkou Community Sessions
          </span>
          <span style={{ color: "rgba(165,180,252,0.6)", fontSize: 15 }}>
            artecks.com/academy
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
