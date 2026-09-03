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
  artecksIdHint: "填入後課後自動獲得 XP 及金幣，並享有 Artecks 商城折扣回饋",
  paymentLast5: "繳費末 5 碼（選填）",
  paymentLast5Hint: "線上轉帳後填入帳號末 5 碼以利核對",

  // Chess experience
  chessExperience: "棋力程度",
  chessExpBeginner: "完全初學（從未下過棋）",
  chessExpKnowsRules: "了解基本規則",
  chessExpExperienced: "有比賽或進階訓練經驗",

  // Special notes
  specialNotes: "備註或問題（選填）",
  specialNotesPlaceholder: "孩子的學習目標、特殊需求、想請教教練的問題…",

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
  bookingSuccessMsg: "以下是您的報名資訊，請截圖保存。",
  bookingError: "報名失敗，請稍後再試。",
  sessionFull: "很抱歉，名額已滿。",
  alreadyBooked: "此電話號碼已報名本堂課。",

  // Confirmation screen
  bookingRef: "報名編號",
  whatToBring: "上課準備",
  whatToBringItems: "棋盤棋子（教室有備用）、筆記本、水",
  paymentTitle: "繳費方式",
  paymentBankTransfer: "銀行轉帳 / 現金",
  paymentBankNote: "可於第一堂課前或當天繳費，轉帳或現金均可。",
  contactCoachLine: "透過 LINE 聯絡教練",
  viewParentCard: "查看完整報告卡",

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
  artecksIdHint: "Earn XP & Coins after class and unlock discounts on the Artecks store",
  paymentLast5: "Last 5 digits of transfer (optional)",
  paymentLast5Hint: "Enter the last 5 digits of your bank transfer for verification",

  // Chess experience
  chessExperience: "Chess Experience",
  chessExpBeginner: "Complete Beginner (never played)",
  chessExpKnowsRules: "Knows the Rules",
  chessExpExperienced: "Has Tournament / Advanced Training Experience",

  // Special notes
  specialNotes: "Notes or Questions (optional)",
  specialNotesPlaceholder: "Child's goals, special needs, questions for the coach…",

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
  bookingSuccessMsg: "Here are your booking details — take a screenshot to save them.",
  bookingError: "Booking failed. Please try again.",
  sessionFull: "Sorry, this session is fully booked.",
  alreadyBooked: "This phone number is already registered for this session.",

  // Confirmation screen
  bookingRef: "Booking Reference",
  whatToBring: "What to Bring",
  whatToBringItems: "Chess set (loaner available), notebook, water",
  paymentTitle: "Payment",
  paymentBankTransfer: "Bank Transfer / Cash",
  paymentBankNote: "Payment can be made before or at the first session. Transfer or cash accepted.",
  contactCoachLine: "Contact Coach via LINE",
  viewParentCard: "View Full Report Card",

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
