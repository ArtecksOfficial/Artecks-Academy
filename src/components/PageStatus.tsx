// Loading / not-found / offline states for the iOS pages.
import Link from "next/link";

export default function PageStatus({ kind }: { kind: "loading" | "notfound" | "error" }) {
  if (kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" aria-busy="true">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
      <p className="text-lg font-bold text-gray-900">
        {kind === "notfound" ? "找不到此頁面 · Not found" : "無法連線 · Can't connect"}
      </p>
      <p className="text-sm text-gray-500">
        {kind === "notfound"
          ? "This page may have moved or expired."
          : "Check your internet connection and try again."}
      </p>
      <Link href="/" className="text-sm font-semibold text-indigo-600">
        回首頁 · Home
      </Link>
    </div>
  );
}
