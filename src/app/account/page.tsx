import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = { title: "My account — Artecks Academy" };

export default function Page() {
  return <AccountClient />;
}
