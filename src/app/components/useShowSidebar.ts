"use client";
// The left sidebar is only for signed-in users. Visitors who aren't logged in
// get the plain top bar and the homepage, no sidebar.
// While the session is still loading we keep the sidebar if a token is stored,
// so signed-in users don't see it flicker away and back.

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "@/lib/auth-client";

export function useShowSidebar(): boolean {
  const { user, isLoading } = useAuth();
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => { setHasToken(!!getAccessToken()); }, [user]);
  return !!user || (isLoading && hasToken);
}
