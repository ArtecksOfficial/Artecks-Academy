'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Academy uses ARTECKS_CORE_API_URL (server-side only), so we derive the base
// from a public var or fall back to the production URL.
const BACKEND = (
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://artecks-backend-production.up.railway.app'
).replace(/\/$/, '')

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    fetch(`${BACKEND}/api/monitoring/pageview/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'academy',
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
