// ─── Site navigation: one list for the desktop sidebar and the phone menu ────
import {
  BookOpenCheck, CalendarDays, ClipboardList, MessageSquareHeart, UserCog,
  Award, BookOpen, CalendarPlus, GraduationCap, HelpCircle, Home, LayoutDashboard, MessageCircle,
  Languages, Package, Settings, Sparkles, Swords, Trophy, UserRound, Users, type LucideIcon,
} from "lucide-react";
import { CHESS_URL } from "@/lib/kid-mode";
import { TEACH_URL } from "@/lib/teach";
import { GEMS_ENABLED } from "@/lib/gems";
import { ACHIEVEMENTS_ENABLED } from "@/lib/achievements-flag";

export interface Item { tab?: string; href: string; en: string; zh: string; icon: LucideIcon; external?: boolean; newTab?: boolean; guardianOnly?: boolean; guestOnly?: boolean }
export interface Group { en: string; zh: string; items: Item[]; signedInOnly?: boolean }

export const GROUPS: Group[] = [
  {
    en: "Academy", zh: "學院",
    items: [
      { href: "/", en: "Home", zh: "首頁", icon: Home, guestOnly: true },
      { href: "/coaches", en: "Coaches & programs", zh: "教練與課程", icon: Users, guestOnly: true },
      { href: "/book", en: "Book a lesson", zh: "預約課程", icon: CalendarPlus, guardianOnly: true },
      { href: "/packages", en: "Lesson packages", zh: "課程套票", icon: Package, guardianOnly: true },
      { href: "/leaderboard", en: "Leaderboard", zh: "排行榜", icon: Trophy },
      ...(ACHIEVEMENTS_ENABLED ? [] : [{ href: "/achievements", en: "How XP works", zh: "XP 怎麼賺", icon: Sparkles }]),
    ],
  },
  {
    en: "My learning", zh: "我的學習", signedInOnly: true,
    items: [
      { href: "/dashboard", en: "Dashboard", zh: "學習總覽", icon: LayoutDashboard, guardianOnly: true },
      { href: "/bookings/mine", en: "My kids' lessons", zh: "孩子的課程", icon: BookOpen, guardianOnly: true },
      ...(ACHIEVEMENTS_ENABLED ? [{ href: "/achievements", en: "Achievements", zh: "家長成就", icon: Award, guardianOnly: true }] : []),
      { href: "/account", en: GEMS_ENABLED ? "Account & gems" : "Account", zh: GEMS_ENABLED ? "帳戶與寶石" : "帳戶", icon: UserRound },
      { href: "/settings", en: "Settings", zh: "設定", icon: Settings, guardianOnly: true },
    ],
  },
  {
    en: "More", zh: "更多",
    items: [
      { href: CHESS_URL, en: "Play chess", zh: "線上下棋", icon: Swords, external: true },
      { href: "/coach", en: "For coaches", zh: "教練專區", icon: GraduationCap, guardianOnly: true },
      { href: TEACH_URL, en: "Be a teacher", zh: "成為老師", icon: Languages, guardianOnly: true },
      { href: "/#faq", en: "FAQ", zh: "常見問題", icon: HelpCircle },
      { href: "/#line-contact", en: "Contact", zh: "聯絡我們", icon: MessageCircle },
    ],
  },
];



// Coach mode (Fiverr-style "switch to selling"): the whole menu becomes the
// coach's workspace. Each item opens a tab of the coach dashboard (/coach?tab=…).
export const COACH_GROUPS: Group[] = [
  {
    en: "Coaching", zh: "教學",
    items: [
      { href: "/coach?tab=sessions", tab: "sessions", en: "My sessions", zh: "我的課程", icon: ClipboardList },
      { href: "/coach?tab=homework", tab: "homework", en: "Homework", zh: "作業", icon: BookOpenCheck },
      { href: "/coach?tab=availability", tab: "availability", en: "Calendar & hours", zh: "行事曆與時段", icon: CalendarDays },
      { href: "/coach?tab=profile", tab: "profile", en: "My profile", zh: "我的檔案", icon: UserCog },
    ],
  },
  {
    en: "Students", zh: "學生",
    items: [
      { href: "/coach?tab=packages", tab: "packages", en: "Packages left", zh: "套票剩餘", icon: Package },
      { href: "/coach?tab=feedback", tab: "feedback", en: "Parent feedback", zh: "家長回饋", icon: MessageSquareHeart },
      { href: "/coach?tab=arena", tab: "arena", en: "Academy Arena", zh: "Academy Arena", icon: Trophy },
    ],
  },
  {
    en: "More", zh: "更多",
    items: [
      { href: CHESS_URL, en: "Play chess", zh: "線上下棋", icon: Swords, external: true },
      { href: "/coaches", en: "Coaches page", zh: "教練與課程", icon: Users },
      { href: "/#faq", en: "FAQ", zh: "常見問題", icon: HelpCircle },
      { href: "/#line-contact", en: "Contact", zh: "聯絡我們", icon: MessageCircle },
    ],
  },
];
