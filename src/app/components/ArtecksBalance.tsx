"use client";

import { useEffect, useState, useRef } from "react";

interface WalletData {
  xp?: number;
  gems?: number;
}

export default function ArtecksBalance() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem("artecks_account_id");
      if (id) {
        setAccountId(id);
        fetchWallet(id);
      }
    } catch {}
  }, []);

  function fetchWallet(id: string) {
    setLoading(true);
    fetch(`/api/wallet?account_id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && (data.xp !== undefined || data.gems !== undefined)) {
          setWallet(data);
        } else {
          setWallet(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function openLink() {
    setLinking(true);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    const id = input.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/wallet?account_id=${encodeURIComponent(id)}`);
      if (!res.ok) { setError("Account not found"); setLoading(false); return; }
      const data = await res.json();
      if (data.xp === undefined && data.gems === undefined) {
        setError("Account not found"); setLoading(false); return;
      }
      localStorage.setItem("artecks_account_id", id);
      setAccountId(id);
      setWallet(data);
      setLinking(false);
      setInput("");
    } catch {
      setError("Couldn't connect — try again");
    } finally {
      setLoading(false);
    }
  }

  // Linked and has wallet data
  if (accountId && wallet) {
    return (
      <div className="hidden sm:flex items-center gap-1.5">
        {wallet.xp !== undefined && (
          <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
            <span>⭐</span>
            <span>{wallet.xp.toLocaleString()}</span>
          </div>
        )}
        {wallet.gems !== undefined && (
          <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700">
            <span>💎</span>
            <span>{wallet.gems.toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }

  // Linking flow
  if (linking) {
    return (
      <form onSubmit={handleLink} className="hidden sm:flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setError(""); }}
          placeholder="ACT-XXXX"
          className={`text-xs font-mono w-28 px-2.5 py-1.5 rounded-lg border ${error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} focus:outline-none focus:border-indigo-400`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
        >
          {loading ? "…" : "Link"}
        </button>
        <button
          type="button"
          onClick={() => { setLinking(false); setError(""); setInput(""); }}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          ✕
        </button>
        {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
      </form>
    );
  }

  // Not linked — show link prompt
  return (
    <button
      onClick={openLink}
      className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors px-1"
      title="Link your Artecks account to see XP & gems"
    >
      <span>⭐</span>
      <span>Link account</span>
    </button>
  );
}
