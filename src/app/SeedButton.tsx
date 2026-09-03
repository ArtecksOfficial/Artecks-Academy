"use client";

import { useTransition, useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { seedTestSession } from "./actions";

export function SeedButton({ label }: { label: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await seedTestSession();
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-6 py-3 text-sm font-bold text-white transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            建立中…
          </>
        ) : (
          <>
            <Plus size={15} />
            {label}
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-left w-full">
          <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300 font-mono break-all">{error}</p>
        </div>
      )}
    </div>
  );
}
