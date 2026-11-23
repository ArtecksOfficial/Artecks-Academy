// GET /api/sessions → Django /api/academy/sessions/  (used by the iOS bundle)
import { ACADEMY, forward } from "@/lib/proxy";

export async function GET() {
  return forward(`${ACADEMY}/sessions/`);
}
