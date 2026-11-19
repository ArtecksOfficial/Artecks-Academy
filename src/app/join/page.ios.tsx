"use client";
// iOS build: /join/?token=<token> (web: /join/<token> via [token]/page.web.tsx).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JoinClient from "./[token]/JoinClient";
import PageStatus from "@/components/PageStatus";

function JoinLoader() {
  const token = useSearchParams().get("token") ?? "";
  if (!token) return <PageStatus kind="notfound" />;
  return <JoinClient token={token} />;
}

export default function JoinPage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <JoinLoader />
    </Suspense>
  );
}
