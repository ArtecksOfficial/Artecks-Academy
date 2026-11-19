"use client";
// Hero link to English lessons. Shows only once an English coach has open
// hours, so parents never land on an empty booking page.
import { useEffect, useState } from "react";

export default function EnglishLessonsLink({ zh }: { zh: boolean }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/slots?subjects=1")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const en = Array.isArray(list) ? list.find((x: { key: string }) => x.key === "english") : null;
        if (en) setPrice(en.price_twd);
      })
      .catch(() => {});
  }, []);

  if (price === null) return null;
  return (
    <a href="/book?subject=english" className="text-sm font-semibold text-[#E9DCC0] underline underline-offset-4 decoration-[#C49A4A] hover:text-white w-fit">
      {zh ? `也有一對一英文課，每堂 NT$ ${price.toLocaleString()}` : `Also: 1-on-1 English lessons, NT$ ${price.toLocaleString()} each`}
    </a>
  );
}
