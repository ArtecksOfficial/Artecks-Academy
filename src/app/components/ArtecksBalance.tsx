"use client";

import { useEffect, useState } from "react";

interface WalletData {
  xp?: number;
  gems?: number;
  coins?: number;
}

export default function ArtecksBalance() {
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    let accountId: string | null = null;
    try {
      accountId = localStorage.getItem("artecks_account_id");
    } catch {
      return;
    }
    if (!accountId) return;

    fetch(`/api/wallet?account_id=${encodeURIComponent(accountId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && (data.xp !== undefined || data.gems !== undefined)) {
          setWallet(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!wallet) return null;

  return (
    <div className="hidden sm:flex items-center gap-2">
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
