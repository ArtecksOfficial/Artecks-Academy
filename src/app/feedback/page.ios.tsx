"use client";
// iOS build: /feedback/?id=123&t=<token> (web: /feedback/123?t=<token>).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FeedbackClient from "./[bookingId]/FeedbackClient";
import PageStatus from "@/components/PageStatus";

function FeedbackLoader() {
  const sp = useSearchParams();
  const id = sp.get("id") ?? "";
  if (!/^\d+$/.test(id)) return <PageStatus kind="notfound" />;
  return <FeedbackClient bookingId={id} token={sp.get("t") ?? ""} />;
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <FeedbackLoader />
    </Suspense>
  );
}
