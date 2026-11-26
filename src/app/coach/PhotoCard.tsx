"use client";
// Coach dashboard → Profile: upload or remove the photo parents see on /coaches.
// The photo is shrunk in the browser first (max 1200px JPEG) so phone photos
// stay well under the upload size limit.

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";
import CoachAvatar from "../components/CoachAvatar";

const MAX_SIDE = 1200;

async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.88));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoCard({
  zh, name, initials, photoUrl, onChange,
}: { zh: boolean; name: string; initials: string; photoUrl: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setBusy(true); setErr("");
    try {
      const body = new FormData();
      body.append("photo", await shrink(file), "photo.jpg");
      const r = await fetch("/api/coach/me/photo", { method: "POST", headers: authHeaders(), body });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof d.photo === "string" ? d.photo : "");
      onChange(d.photo_url || "");
    } catch (e) {
      const m = e instanceof Error && e.message && e.message !== "encode" ? e.message : "";
      setErr(m || (zh ? "上傳失敗，請換一張 JPG 或 PNG 照片再試一次。" : "Upload didn't work. Please try a JPG or PNG photo."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true); setErr("");
    const r = await fetch("/api/coach/me/photo", { method: "DELETE", headers: authHeaders() }).catch(() => null);
    setBusy(false);
    if (r?.ok) onChange("");
    else setErr(zh ? "無法移除照片，請稍後再試。" : "Couldn't remove the photo. Please try again.");
  }

  return (
    <div className="rounded-3xl bg-white border border-gray-200 p-5 flex items-center gap-4">
      <CoachAvatar coach={{ name: name || "?", avatar_initials: initials, photo_url: photoUrl }}
        className="h-20 w-20 rounded-full" initialsClassName="bg-[#13223F] text-xl font-black text-[#E7C98A]" />
      <div className="flex flex-col gap-2 min-w-0">
        <p className="text-sm font-bold text-[#13223F]">{zh ? "大頭照" : "Profile photo"}</p>
        <p className="text-xs text-gray-500">
          {zh ? "家長會在「教練與課程」頁看到這張照片。建議用清楚的正面照。" : "Parents see this on the Coaches & programs page. A clear, friendly face photo works best."}
        </p>
        <div className="flex items-center gap-3">
          <button type="button" disabled={busy} onClick={() => input.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#13223F] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {photoUrl ? (zh ? "更換照片" : "Change photo") : (zh ? "上傳照片" : "Upload photo")}
          </button>
          {photoUrl && !busy && (
            <button type="button" onClick={remove} className="text-sm font-semibold text-gray-500 underline">
              {zh ? "移除" : "Remove"}
            </button>
          )}
        </div>
        {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
        <input ref={input} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </div>
    </div>
  );
}
