"use client";
// Shared by the teacher sign-up page (/teach) and the coach dashboard's Profile tab.

export interface CoachProfile {
  id?: number; name: string; name_zh: string; title: string; bio: string; subjects: string;
  avatar_initials: string; line_id: string; approval_status?: "approved" | "pending" | "rejected"; is_active?: boolean;
}

export const EMPTY_PROFILE: CoachProfile = { name: "", name_zh: "", title: "", bio: "", subjects: "", avatar_initials: "", line_id: "" };

const field = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A]";

export default function ProfileFields({ value, onChange, zh }: { value: CoachProfile; onChange: (p: CoachProfile) => void; zh: boolean }) {
  const set = (k: keyof CoachProfile) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="text-xs font-semibold text-gray-600">{zh ? "姓名（英文）*" : "Your name *"}
        <input value={value.name} onChange={set("name")} required maxLength={100} placeholder="Sarah Lee" className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600">{zh ? "中文姓名" : "Chinese name"}
        <input value={value.name_zh} onChange={set("name_zh")} maxLength={100} className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">{zh ? "教授科目 *" : "What you teach *"}
        <input value={value.subjects} onChange={set("subjects")} required maxLength={200}
          placeholder={zh ? "例如：西洋棋、英文、數學" : "e.g. Chess, English, Math"} className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">{zh ? "一句話介紹（顯示在名字下方）" : "Headline (shown under your name)"}
        <input value={value.title} onChange={set("title")} maxLength={200}
          placeholder={zh ? "例如：FIDE 認證棋手 · 林口" : "e.g. FIDE-rated player · Linkou"} className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">{zh ? "關於你（給家長看）" : "About you (for parents)"}
        <textarea value={value.bio} onChange={set("bio")} rows={4} maxLength={2000}
          placeholder={zh ? "你的教學經驗、風格、適合的年齡⋯" : "Your teaching experience, style, the ages you teach…"} className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600">{zh ? "頭像縮寫（最多 4 個字）" : "Avatar initials (max 4)"}
        <input value={value.avatar_initials} onChange={(e) => onChange({ ...value, avatar_initials: e.target.value.slice(0, 4).toUpperCase() })}
          placeholder="SL" className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600">{zh ? "LINE ID（排課後家長可見）" : "LINE ID (parents see it once a lesson is booked)"}
        <input value={value.line_id} onChange={set("line_id")} maxLength={50} className={field} />
      </label>
    </div>
  );
}
