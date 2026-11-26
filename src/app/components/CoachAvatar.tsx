// A coach's profile photo, or their initials when they haven't uploaded one.
// `className` sizes and shapes the circle/square; `initialsClassName` styles the fallback.

import type { CSSProperties } from "react";

type CoachLike = { name: string; avatar_initials?: string; photo_url?: string };

export function coachInitials(c: CoachLike): string {
  return c.avatar_initials || c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function CoachAvatar({
  coach, className, initialsClassName = "", style,
}: { coach: CoachLike; className: string; initialsClassName?: string; style?: CSSProperties }) {
  if (coach.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coach.photo_url} alt={coach.name} className={`${className} object-cover shrink-0`} loading="lazy" />;
  }
  return (
    <span className={`${className} flex items-center justify-center shrink-0 ${initialsClassName}`} style={style} aria-hidden="true">
      {coachInitials(coach)}
    </span>
  );
}
