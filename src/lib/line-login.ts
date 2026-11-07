// "Log in with LINE" — the backend builds the LINE authorize URL; LINE sends the
// parent back to /auth/line/callback on this site, which finishes the sign-in.

export function safeNext(next: string | null | undefined, fallback = "/"): string {
  const n = next ?? "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

export async function startLineLogin(next: string): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/line/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: "login",
        next: safeNext(next),
        redirect_uri: `${window.location.origin}/auth/line/callback`,
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.authorize_url) {
      window.location.href = d.authorize_url;
      return null;
    }
    return d.detail || "LINE sign-in is not available right now.";
  } catch {
    return "LINE sign-in is not available right now.";
  }
}
