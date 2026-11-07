import type { Metadata } from "next";
import JoinClient from "./JoinClient";

export const metadata: Metadata = { title: "Join Artecks Academy", robots: { index: false } };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <JoinClient token={token} />;
}
