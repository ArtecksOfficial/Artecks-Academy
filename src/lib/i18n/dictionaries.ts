// ─── i18n Dictionaries ────────────────────────────────────────────────────────
// Flat key-value dictionary for zh-TW and en locales.
// Add keys here; TypeScript will enforce parity via `satisfies`.

export type Locale = "zh" | "en";

const zh = {
  // Brand
  brandName: "Artecks Academy",

  // Session landing page
  sessionDetails: "課程詳情",
  spotsLeft: "剩餘名額",
  spotsOf: "名",
  fullyBooked: "名額已滿",
  bookNow: "立即報名",
  bookingUnavailable: "報名暫停",

  // Booking form
  parentName: "家長姓名",
  parentPhone: "家長電話",
  studentName: "學生姓名",
  studentAge: "學生年齡",
  artecksId: "Artecks 帳號 ID（選填）",
  artecksIdHint: "填入後課後自動獲得 XP 及金幣",
  paymentLast5: "繳費末 5 碼（選填）",
  paymentLast5Hint: "線上轉帳後填入帳號末 5 碼以利核對",

  // Contact channel selector
  contactMethod: "聯絡方式",
  whatsapp: "WhatsApp",
  line: "LINE",
  smsSms: "簡訊 / SMS",
  emailContact: "Email",
  contactValue: "聯絡資訊",
  contactPlaceholderWhatsapp: "+886 912 345 678",
  contactPlaceholderLine: "LINE ID 或手機號碼",
  contactPlaceholderSms: "+886 912 345 678",
  contactPlaceholderEmail: "example@email.com",

  // Booking submit / states
  submitting: "送出中…",
  submitBooking: "確認報名",
  bookingSuccess: "報名成功！",
  bookingSuccessMsg: "我們將透過您選擇的管道與您聯絡確認。",
  bookingError: "報名失敗，請稍後再試。",
  sessionFull: "很抱歉，名額已滿。",
  alreadyBooked: "此電話號碼已報名本堂課。",

  // Coach cockpit
  reportBtn: "報告",
  markAttend: "出席 + 獎勵",
  alreadyRewarded: "已完成",
  attended: "已出席",
  pendingAttend: "待確認",
  totalBookings: "總報名",
  noStudents: "目前沒有學生報名。",
  errGeneric: "發生錯誤，請重試。",

  // Report form
  skillTagsLabel: "技能標籤（最多 3 個）",
  coachNotesLabel: "教練筆記",
  coachNotesPlaceholder: "今日課堂表現、進步之處、待改善項目…",
  adjustRewards: "調整獎勵數量",
  xpLabel: "XP 經驗值",
  coinsLabel: "金幣",
  saving: "儲存中…",
  saveReport: "儲存報告",
  reportSaved: "報告已儲存！",
  viewParentCard: "查看家長報告卡",
  cancelBtn: "取消",
  closeBtn: "關閉",

  // Report card
  reportCardLabel: "課後學習報告",
  sessionTopic: "課程主題",
  skillsLabel: "本堂技能",
  coachComments: "教練評語",
  summaryLabel: "AI 課堂摘要",
  reportPending: "📋 報告製作中，請稍後回來查看。",
  lootBoxTitle: "Artecks 戰利品箱",
  lootBoxSub: "本堂獎勵已發送至您的帳號！",
  xpAwarded: "XP 經驗值",
  coinsAwarded: "金幣",
  sentTo: "已發送至 Artecks 帳號：{id}",
  confirmedAttend: "出席確認",
  pendingAttendance: "出席確認中",

  // Share buttons
  shareTitle: "分享報告",
  shareWhatsapp: "WhatsApp 分享",
  shareLine: "LINE 分享",
  copyLink: "複製連結",
  linkCopied: "已複製！",
};

const en: typeof zh = {
  // Brand
  brandName: "Artecks Academy",

  // Session landing page
  sessionDetails: "Session Details",
  spotsLeft: "spots left",
  spotsOf: "",
  fullyBooked: "Fully Booked",
  bookNow: "Book Now",
  bookingUnavailable: "Booking Unavailable",

  // Booking form
  parentName: "Parent Name",
  parentPhone: "Parent Phone",
  studentName: "Student Name",
  studentAge: "Student Age",
  artecksId: "Artecks Account ID (optional)",
  artecksIdHint: "Earn XP & Coins automatically after class",
  paymentLast5: "Last 5 digits of transfer (optional)",
  paymentLast5Hint: "Enter the last 5 digits of your bank transfer for verification",

  // Contact channel selector
  contactMethod: "Contact Method",
  whatsapp: "WhatsApp",
  line: "LINE",
  smsSms: "SMS",
  emailContact: "Email",
  contactValue: "Contact Details",
  contactPlaceholderWhatsapp: "+886 912 345 678",
  contactPlaceholderLine: "LINE ID or phone number",
  contactPlaceholderSms: "+886 912 345 678",
  contactPlaceholderEmail: "example@email.com",

  // Booking submit / states
  submitting: "Submitting…",
  submitBooking: "Confirm Booking",
  bookingSuccess: "Booking Confirmed!",
  bookingSuccessMsg: "We'll reach out via your selected contact method.",
  bookingError: "Booking failed. Please try again.",
  sessionFull: "Sorry, this session is fully booked.",
  alreadyBooked: "This phone number is already registered for this session.",

  // Coach cockpit
  reportBtn: "Report",
  markAttend: "Attend + Reward",
  alreadyRewarded: "Done",
  attended: "Attended",
  pendingAttend: "Pending",
  totalBookings: "Total",
  noStudents: "No students booked yet.",
  errGeneric: "An error occurred. Please retry.",

  // Report form
  skillTagsLabel: "Skill Tags (up to 3)",
  coachNotesLabel: "Coach Notes",
  coachNotesPlaceholder: "Today's performance, improvements, areas to work on…",
  adjustRewards: "Adjust Rewards",
  xpLabel: "XP",
  coinsLabel: "Coins",
  saving: "Saving…",
  saveReport: "Save Report",
  reportSaved: "Report Saved!",
  viewParentCard: "View Parent Report Card",
  cancelBtn: "Cancel",
  closeBtn: "Close",

  // Report card
  reportCardLabel: "Post-Class Report",
  sessionTopic: "Session Topic",
  skillsLabel: "Skills Covered",
  coachComments: "Coach Comments",
  summaryLabel: "AI Session Summary",
  reportPending: "📋 Report is being prepared. Check back soon.",
  lootBoxTitle: "Artecks Loot Box",
  lootBoxSub: "Rewards have been sent to your account!",
  xpAwarded: "XP Earned",
  coinsAwarded: "Coins",
  sentTo: "Sent to Artecks account: {id}",
  confirmedAttend: "Attendance Confirmed",
  pendingAttendance: "Attendance Pending",

  // Share buttons
  shareTitle: "Share Report",
  shareWhatsapp: "Share via WhatsApp",
  shareLine: "Share via LINE",
  copyLink: "Copy Link",
  linkCopied: "Copied!",
};

export const dictionaries = { zh, en } satisfies Record<Locale, Record<string, string>>;
export type DictionaryKey = keyof typeof zh;
