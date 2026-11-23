// GET /session/:id/opengraph-image — the session's share image (web build only).
// Referenced explicitly from ../page.web.tsx generateMetadata().
import Image from "../og-image";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return Image({ params: ctx.params });
}
