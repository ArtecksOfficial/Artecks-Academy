import type { Metadata } from "next";
import PackagesClient from "./PackagesClient";

export const metadata: Metadata = {
  title: "Lesson packages — Artecks Academy",
  description: "Buy 5 or 10 chess lessons at once in Linkou. Buy 10, get 1 free. Use gems for up to 10% off.",
};

export default function Page() {
  return <PackagesClient />;
}
