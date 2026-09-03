"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

export async function seedTestSession(): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const now = new Date();
  const start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const end   = new Date(start.getTime() + 90 * 60 * 1000);

  const { error } = await supabase.from("sessions").insert({
    title:                "週末西洋棋戰術實戰班 (Linkou Studio)",
    topic:                "騎士雙重攻擊與殘局計算",
    age_group:            "7–10 歲",
    location_name:        "晴空樹社區 交誼閱覽廳",
    location_address:     "新北市林口區文化二路一段",
    private_access_notes: "請於開課前 5 分鐘抵達一樓大廳向保全領取磁扣至 2F 閱覽室。",
    start_time:           start.toISOString(),
    end_time:             end.toISOString(),
    price_twd:            500,
    max_seats:            4,
    booking_open:         true,
    status:               "open",
  });

  if (error) {
    return { error: `${error.code ?? ""} ${error.message}`.trim() };
  }

  revalidatePath("/");
  return {};
}
