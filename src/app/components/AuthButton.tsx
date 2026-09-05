"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

interface WalletData {
  xp: number;
  gems: number;
}

interface Props {
  /** "dark" = used on dark hero headers; "light" = used on white bg headers */
  variant?: "dark" | "light";
}

export default function AuthButton({ variant = "light" }: Props) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dark = variant === "dark";

  // Fetch wallet when user is logged in
  useEffect(() => {
    if (!user?.account_id) return;
    fetch(`/api/wallet?account_id=${encodeURIComponent(user.account_id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.xp === "number") {
          setWallet({ xp: data.xp, gems: data.gems ?? 0 });
        }
      })
      .catch(() => {});
  }, [user?.account_id]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div
        className={`h-8 w-24 rounded-full animate-pulse ${dark ? "bg-white/10" : "bg-gray-200"}`}
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/login")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            dark
              ? "text-white/70 hover:text-white"
              : "text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200"
          }`}
        >
          Log in
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-full transition-colors"
        >
          Sign up
        </button>
      </div>
    );
  }

  const displayName = user.first_name || user.username;

  return (
    <div className="flex items-center gap-2">
      {wallet && (
        <>
          <span className="hidden sm:flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
            ⭐ {wallet.xp.toLocaleString()} XP
          </span>
          <span className="hidden sm:flex items-center gap-1 bg-violet-50 text-violet-600 border border-violet-200 text-xs font-bold px-2.5 py-1 rounded-full">
            💎 {wallet.gems.toLocaleString()}
          </span>
        </>
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            dark
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              dark ? "bg-indigo-400" : "bg-indigo-500"
            }`}
          >
            {displayName[0]?.toUpperCase()}
          </span>
          {displayName}
          <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm text-gray-800 font-semibold truncate">{user.email}</p>
            </div>
            {user.account_id && (
              <div className="px-4 py-1.5 border-b border-gray-100">
                <p className="text-xs text-gray-400 font-mono">{user.account_id}</p>
              </div>
            )}
            {wallet && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
                <span className="text-xs font-bold text-amber-600">⭐ {wallet.xp.toLocaleString()} XP</span>
                <span className="text-xs font-bold text-violet-600">💎 {wallet.gems.toLocaleString()}</span>
              </div>
            )}
            <a
              href="/bookings/mine"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              My Bookings
            </a>
            <button
              onClick={async () => {
                setMenuOpen(false);
                await logout();
                router.push("/");
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
