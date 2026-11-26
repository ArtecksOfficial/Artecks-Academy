// GET /api/coaches → Django /api/academy/coaches/  (public; used by the iOS bundle)
import { ACADEMY, forward } from "@/lib/proxy";

export async function GET() {
  return forward(`${ACADEMY}/coaches/`);
}
