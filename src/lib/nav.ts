// ─── Site navigation: one list for the desktop sidebar and the phone menu ────
import {
  Award, BookOpen, CalendarPlus, GraduationCap, HelpCircle, Home, LayoutDashboard, MessageCircle,
  Languages, Package, Settings, Swords, Trophy, UserRound, Users, type LucideIcon,
} from "lucide-react";
import { CHESS_URL } from "@/lib/kid-mode";
import { TEACH_LINE_URL } from "@/lib/teach";

export interface Item { href: string; en: string; zh: string; icon: LucideIcon; external?: boolean; newTab?: boolean; guardianOnly?: boolean }
export interface Group { en: string; zh: string; items: Item[]; signedInOnly?: boolean }

export const GROUPS: Group[] = [
  {
    en: "My family", zh: "我的家庭", signedInOnly: true,
    items: [
      { href: "/dashboard", en: "Dashboard", zh: "學習總覽", icon: LayoutDashboard, guardianOnly: true },
      { href: "/bookings/mine", en: "My lessons", zh: "我的課程", icon: BookOpen, guardianOnly: true },
      { href: "/achievements", en: "Achievements", zh: "家長成就", icon: Award, guardianOnly: true },
      { href: "/account", en: "Account & gems", zh: "帳戶與寶石", icon: UserRound },
      { href: "/settings", en: "Settings", zh: "設定", icon: Settings, guardianOnly: true },
    ],
  },
  {
    en: "Academy", zh: "學院",
    items: [
      { href: "/", en: "Home", zh: "首頁", icon: Home },
      { href: "/#coaches-programs", en: "Coaches & programs", zh: "教練與課程", icon: Users },
      { href: "/book", en: "Book a lesson", zh: "預約課程", icon: CalendarPlus, guardianOnly: true },
      { href: "/packages", en: "Lesson packages", zh: "課程套票", icon: Package, guardianOnly: true },
      { href: "/leaderboard", en: "Leaderboard", zh: "排行榜", icon: Trophy },
    ],
  },
  {
    en: "More", zh: "更多",
    items: [
      { href: CHESS_URL, en: "Play chess", zh: "線上下棋", icon: Swords, external: true },
      { href: "/coach", en: "For coaches", zh: "教練專區", icon: GraduationCap, guardianOnly: true },
      { href: TEACH_LINE_URL, en: "Teach with us", zh: "加入師資團隊", icon: Languages, external: true, newTab: true, guardianOnly: true },
      { href: "/#faq", en: "FAQ", zh: "常見問題", icon: HelpCircle },
      { href: "/#line-contact", en: "Contact", zh: "聯絡我們", icon: MessageCircle },
    ],
  },
];

