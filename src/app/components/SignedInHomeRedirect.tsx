"use client";
// Signed-in people don't need the landing page: parents go to their dashboard,
// kids to the leaderboard. Links to /#faq or /#line-contact still open the page.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthContext";
import { getKidSession } from "@/lib/kid-mode";

export default function SignedInHomeRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoading || !user || window.location.hash) return;
    router.replace(getKidSession() ? "/leaderboard" : "/dashboard");
  }, [user, isLoading, router]);
  return null;
}
