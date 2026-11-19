"use client";
// ─── Parent / coach mode (Fiverr-style "Switch to selling / buying") ─────────
// Accounts with a coach profile (approved or waiting for approval) can switch
// the whole site menu between parent mode and coach mode. The choice is kept
// on this device; opening /coach always means coach mode.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { getKidSession } from "@/lib/kid-mode";

export type Mode = "parent" | "coach";
const KEY = "artecks_mode";

interface Ctx { isCoach: boolean; mode: Mode; switchTo: (m: Mode) => void; coachTab: string }
const ModeCtx = createContext<Ctx>({ isCoach: false, mode: "parent", switchTo: () => {}, coachTab: "sessions" });

export const useMode = () => useContext(ModeCtx);

/** Coach dashboard tabs live in ?tab=; tell the menu when it changes without a navigation. */
export function announceCoachTab(tab: string) {
  try { window.dispatchEvent(new CustomEvent("coach-tab", { detail: tab })); } catch { /* noop */ }
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const path = usePathname() || "/";
  const router = useRouter();
  const [isCoach, setIsCoach] = useState(false);
  const [stored, setStored] = useState<Mode>("parent");
  const [coachTab, setCoachTab] = useState("sessions");

  useEffect(() => { try { if (localStorage.getItem(KEY) === "coach") setStored("coach"); } catch { /* noop */ } }, []);

  useEffect(() => {
    if (!user || getKidSession()) { setIsCoach(false); return; }
    let live = true;
    fetch("/api/coach/me", { headers: authHeaders(), cache: "no-store" })
      .then((r) => { if (live) setIsCoach(r.ok); })
      .catch(() => {});
    return () => { live = false; };
  }, [user]);

  useEffect(() => {
    const read = () => setCoachTab(new URLSearchParams(window.location.search).get("tab") || "sessions");
    read();
    const onTab = (e: Event) => setCoachTab((e as CustomEvent<string>).detail || "sessions");
    window.addEventListener("coach-tab", onTab);
    window.addEventListener("popstate", read);
    return () => { window.removeEventListener("coach-tab", onTab); window.removeEventListener("popstate", read); };
  }, [path]);

  const onCoachPage = path === "/coach" || path.startsWith("/coach/");
  const mode: Mode = isCoach && (onCoachPage || stored === "coach") ? "coach" : "parent";

  const switchTo = useCallback((m: Mode) => {
    setStored(m);
    try { localStorage.setItem(KEY, m); } catch { /* noop */ }
    router.push(m === "coach" ? "/coach?tab=sessions" : "/dashboard");
  }, [router]);

  return <ModeCtx.Provider value={{ isCoach, mode, switchTo, coachTab }}>{children}</ModeCtx.Provider>;
}
