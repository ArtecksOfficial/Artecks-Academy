import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? 'http://localhost:8000'

type Session = {
  title: string
  topic: string | null
  start_time: string
  location_name: string | null
  price_twd: number | null
  available_spots: number
  is_full: boolean
  coach: {
    name: string
    name_zh: string | null
    avatar_initials: string
  } | null
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let session: Session | null = null
  try {
    const res = await fetch(`${BACKEND}/api/academy/sessions/${id}/`, {
      cache: 'no-store',
    })
    if (res.ok) session = await res.json()
  } catch {}

  const title = session?.title ?? 'Chess Session'
  const coachName = session?.coach?.name ?? ''
  const coachInitials =
    session?.coach?.avatar_initials ||
    coachName.slice(0, 2).toUpperCase() ||
    '♟'
  const price = session?.price_twd
    ? `NT$ ${session.price_twd.toLocaleString()}`
    : 'Free'
  const location = session?.location_name ?? ''
  const isFull = session?.is_full ?? false
  const spots = session?.available_spots ?? 0

  let dateStr = ''
  if (session?.start_time) {
    dateStr = new Date(session.start_time).toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const titleSize = title.length > 32 ? 52 : title.length > 20 ? 60 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          backgroundColor: '#0d1117',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 6,
            height: '100%',
            backgroundColor: '#6366f1',
          }}
        />

        {/* Large decorative knight — right side background */}
        <div
          style={{
            position: 'absolute',
            right: -10,
            bottom: -40,
            fontSize: 380,
            lineHeight: 1,
            color: '#ffffff',
            opacity: 0.03,
            display: 'flex',
          }}
        >
          ♞
        </div>

        {/* Indigo glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            opacity: 0.08,
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 72px',
            flex: 1,
          }}
        >
          {/* Brand row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 44,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#fff',
              }}
            >
              ♟
            </div>
            <span
              style={{
                color: '#6366f1',
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              ARTECKS ACADEMY
            </span>
          </div>

          {/* Session title */}
          <div
            style={{
              color: '#f8fafc',
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              maxWidth: 860,
              marginBottom: 28,
              display: 'flex',
            }}
          >
            {title}
          </div>

          {/* Meta chips */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 'auto',
            }}
          >
            {coachName && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'rgba(99,102,241,0.15)',
                  borderRadius: 100,
                  padding: '8px 18px 8px 8px',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {coachInitials}
                </div>
                <span style={{ color: '#c7d2fe', fontSize: 17, fontWeight: 600 }}>
                  {coachName}
                </span>
              </div>
            )}

            {dateStr && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 100,
                  padding: '8px 18px',
                  color: '#94a3b8',
                  fontSize: 17,
                }}
              >
                📅 {dateStr}
              </div>
            )}

            {location && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 100,
                  padding: '8px 18px',
                  color: '#94a3b8',
                  fontSize: 17,
                }}
              >
                📍 {location}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              marginTop: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{
                  color: '#818cf8',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {price}
              </span>
              <span style={{ color: '#475569', fontSize: 16 }}>/ session</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: isFull
                  ? 'rgba(245,158,11,0.15)'
                  : 'rgba(34,197,94,0.15)',
                borderRadius: 100,
                padding: '10px 24px',
                color: isFull ? '#fbbf24' : '#4ade80',
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isFull ? '#fbbf24' : '#4ade80',
                  display: 'flex',
                }}
              />
              {isFull ? '名額已滿' : `剩 ${spots} 個名額`}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
