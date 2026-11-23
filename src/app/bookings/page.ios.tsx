"use client";
// iOS build: /bookings → /bookings/mine (the web build does this in next.config redirects()).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageStatus from "@/components/PageStatus";

export default function BookingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/bookings/mine");
  }, [router]);
  return <PageStatus kind="loading" />;
}
