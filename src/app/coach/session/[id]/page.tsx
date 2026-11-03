// Old coach cockpit link (used to redirect to Django admin, which required
// staff access and exposed every family's contact details). Coaches now use
// the scoped /coach dashboard.
import { redirect } from "next/navigation";

export default function CoachSessionPage() {
  redirect("/coach");
}
