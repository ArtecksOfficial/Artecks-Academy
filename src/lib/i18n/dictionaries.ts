// ─── i18n Dictionaries ────────────────────────────────────────────────────────
// Flat key-value dictionary for zh-TW and en locales.
// Add keys here; TypeScript will enforce parity via `satisfies`.

export type Locale = "zh" | "en";

const zh = {
  // Brand
  brandName: "Artecks Academy",

  // ── Homepage ────────────────────────────────────────────────────────────────
  // Hero
  heroTitle1: "棋藝課程",
  heroTitle2: "孩子愛上學習。",
  heroCta: "瀏覽課程",
  heroSubscribe: "訂閱會員",

  // Location pill
  locationLabel: "新北市林口區",

  // Trust pills
  trustCoaches: "專業教練",
  trustAges: "5歲以上",
  trustGroups: "小班教學",
  trustRewards: "XP 與寶石獎勵",

  // How it works
  howItWorksTitle: "如何報名",
  howItWorksSub: "三個步驟，從好奇到上桌",
  step1Title: "選擇課程",
  step1Desc: "瀏覽即將開課的棋藝課程與活動，可依年齡、日期或教練篩選。",
  step2Title: "預約名額",
  step2Desc: "填寫姓名與聯絡資訊即可完成報名。會員享有優先預約及折扣優惠。",
  step3Title: "出席並獲得獎勵",
  step3Desc: "出席課程後，孩子將自動在 Artecks 平台獲得 XP 和金幣。",

  // Sessions section
  upcomingTitle: "近期課程",
  upcomingSubOpen: "個課程開放報名",
  upcomingSubEmpty: "請持續關注，每週新增課程",
  seeAllSessions: "查看全部課程與行事曆",
  calendarView: "行事曆檢視",
  emptyTitle: "目前沒有開放課程",
  emptyDesc: "每週新增課程與活動，訂閱會員以獲得最新通知。",

  // Session card status
  statusFull: "額滿",
  statusCancelled: "已取消",
  statusOpen: "開放報名",
  withCoach: "教練",
  priceFree: "免費",
  durationMin: "分鐘",

  // Membership section
  membersBadge: "Artecks 會員",
  membersSaveLabel: "每堂課享折扣",
  benefit1: "優先預約 — 名額優先為您保留",
  benefit2: "會員專屬活動與工作坊",
  benefit3: "結帳時自動套用折扣",
  cancelAnytime: "隨時取消 · Stripe 安全付款",

  // Rewards
  rewardsTitle: "內建獎勵系統",
  rewardsSub: "每堂課都能為孩子賺取 Artecks 平台貨幣",
  xpTitle: "XP 經驗值 — 成長紀錄",
  xpDesc: "每堂課自動發放，追蹤孩子的學習歷程，決定 Artecks 等級。",
  gemsTitle: "寶石 — 進階獎勵",
  gemsDesc: "通過里程碑與出席課程獲得，可用於 Artecks 遊戲的進階功能。",
  coinsTitle: "金幣 — 日常貨幣",
  coinsDesc: "棋藝、小遊戲與 Artecks 生態系的日常通貨。",

  // Coaches
  coachesTitle: "認識教練",
  coachesSub: "所有教練皆由 Artecks 培訓及審核",
  viewSessions: "查看課程",

  // Footer
  footerBook: "預約課程",
  footerBookings: "我的報名",

  // ── Session landing page ───────────────────────────────────────────────────
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

  // ── Homepage ────────────────────────────────────────────────────────────────
  // Hero
  heroTitle1: "Chess Lessons",
  heroTitle2: "Kids Actually Love.",
  heroCta: "Browse Sessions",
  heroSubscribe: "Subscribe",

  // Location pill
  locationLabel: "Linkou, New Taipei",

  // Trust pills
  trustCoaches: "Expert Coaches",
  trustAges: "Ages 5 and up",
  trustGroups: "Small Groups",
  trustRewards: "XP & Gem Rewards",

  // How it works
  howItWorksTitle: "How it works",
  howItWorksSub: "Three steps from curious to playing",
  step1Title: "Pick a session",
  step1Desc: "Browse upcoming chess lessons and enrichment events. Filter by age group, date, or coach.",
  step2Title: "Book your spot",
  step2Desc: "Reserve with your name and contact info. Members get priority access and discounts on every session.",
  step3Title: "Show up & earn",
  step3Desc: "Attend the session and your child earns XP and gems on the Artecks platform — automatically.",

  // Sessions section
  upcomingTitle: "Upcoming Sessions",
  upcomingSubOpen: "sessions open to book",
  upcomingSubEmpty: "Check back soon — new sessions added weekly",
  seeAllSessions: "See all sessions & calendar",
  calendarView: "Calendar view",
  emptyTitle: "No sessions open right now",
  emptyDesc: "New lessons and events are added every week. Subscribe to get notified when spots open up.",

  // Session card status
  statusFull: "Full",
  statusCancelled: "Cancelled",
  statusOpen: "Open",
  withCoach: "with",
  priceFree: "Free",
  durationMin: "min",

  // Membership section
  membersBadge: "Artecks Members",
  membersSaveLabel: "on every session.",
  benefit1: "Priority booking — your spot is held first",
  benefit2: "Member-only events and workshops",
  benefit3: "Discount applied automatically at checkout",
  cancelAnytime: "Cancel anytime · Stripe-secured",

  // Rewards
  rewardsTitle: "Built-in Rewards",
  rewardsSub: "Every session earns your child currency on the Artecks platform",
  xpTitle: "XP — Progress",
  xpDesc: "Earned automatically every session. Tracks your child's journey and determines their Artecks level.",
  gemsTitle: "Gems — Premium",
  gemsDesc: "Earned through milestones and class attendance. Spent on premium features across Artecks games.",
  coinsTitle: "Coins — Everyday",
  coinsDesc: "The everyday in-game currency for chess, mini-games, and the Artecks ecosystem.",

  // Coaches
  coachesTitle: "Meet the Coaches",
  coachesSub: "All coaches are trained and vetted by Artecks",
  viewSessions: "View sessions",

  // Footer
  footerBook: "Book a Session",
  footerBookings: "My Bookings",

  // ── Session landing page ───────────────────────────────────────────────────
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
