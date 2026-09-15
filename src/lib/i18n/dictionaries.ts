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

  // ── English callout ─────────────────────────────────────────────────────────
  englishBadge: "🇬🇧 全英語授課",
  englishCalloutTitle: "全英語教學環境",
  englishCalloutDesc: "每堂課由認證教練以純英語進行。孩子在學下棋的同時，自然而然地沉浸在英語環境中 — 一舉兩得。",

  // ── Why Chess section ────────────────────────────────────────────────────────
  whyChessTitle: "為什麼學西洋棋？",
  whyChessSub: "西洋棋培養一輩子受用的能力，而且孩子真的很喜歡。",
  whyChess1Icon: "🧠",
  whyChess1Title: "批判性思考",
  whyChess1Desc: "每一步棋都需要分析與預判。孩子學會提前思考三步，將思維結構化。",
  whyChess2Icon: "⏳",
  whyChess2Title: "耐心與自律",
  whyChess2Desc: "觀察、等待、執行長期計畫 — 西洋棋訓練自我控制的能力勝過其他活動。",
  whyChess3Icon: "⚙️",
  whyChess3Title: "邏輯與策略",
  whyChess3Desc: "西洋棋是純粹的邏輯體現。孩子深刻理解因果關係，建立系統性思維。",
  whyChess4Icon: "💪",
  whyChess4Title: "心理韌性",
  whyChess4Desc: "失敗、反思、調整、再出發 — 每一局棋都在鍛鍊面對挫折的心理素質。",
  whyChess5Icon: "🎯",
  whyChess5Title: "壓力控制",
  whyChess5Desc: "在時間壓力下做出決策，讓孩子學會在關鍵時刻保持冷靜與專注。",
  whyChess6Icon: "🗣️",
  whyChess6Title: "英語沉浸學習",
  whyChess6Desc: "所有課程全程英語授課。棋局用語自然成為日常詞彙，英語能力悄悄提升。",

  // ── Testimonials ─────────────────────────────────────────────────────────────
  testimonialsTitle: "林口家長怎麼說",
  testimonialsSub: "來自我們社群真實家庭的回饋",
  testimonial1Quote: "我兒子以前不敢開口說英語。在這裡上了兩個月後，他已經能用英語解釋棋步、主動問問題了。真的很驚人。",
  testimonial1Name: "Sarah L.",
  testimonial1Role: "8歲孩子的媽媽",
  testimonial2Quote: "小班制是打動我們的關鍵。教練真的了解我女兒的弱點，每堂課都針對她加強。",
  testimonial2Name: "Kevin C.",
  testimonial2Role: "6歲孩子的爸爸",
  testimonial3Quote: "我們試過補習班的西洋棋課，感覺就像托兒所。這裡的教練有系統、有熱忱，孩子每堂課都有明顯進步。",
  testimonial3Name: "Michelle T.",
  testimonial3Role: "10歲孩子的媽媽",

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  faqTitle: "家長常見問題",
  faqSub: "林口家庭最想知道的事",
  faq1Q: "課程全程用英語嗎？",
  faq1A: "是的。教練每堂課 100% 以英語授課。我們以西洋棋為媒介，讓孩子在自然情境中學習英語 — 沒有翻譯，沒有中英混雜。",
  faq2Q: "幾歲適合開始？",
  faq2A: "我們歡迎 5 歲以上的孩子參加。任何年齡的初學者都非常歡迎 — 大多數孩子報名時都是完全的零基礎。",
  faq3Q: "每堂課有幾位學生？",
  faq3A: "我們堅持小班制，通常每位教練帶 4 到 8 名學生，確保每個孩子都能獲得真正的個人關注。",
  faq4Q: "孩子需要自備棋組嗎？",
  faq4A: "完全不需要。課程現場提供所有器材。若孩子想在家練習，我們很樂意推薦合適的棋組。",
  faq5Q: "孩子完全沒接觸過西洋棋沒關係嗎？",
  faq5A: "沒問題！我們大多數學生一開始都是零基礎。課程從最基礎的規則開始，依照每個孩子的進度循序漸進。",

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

  // ── English callout ─────────────────────────────────────────────────────────
  englishBadge: "🇬🇧 Taught in English",
  englishCalloutTitle: "English-Only Instruction",
  englishCalloutDesc: "Every lesson is conducted 100% in English by our vetted coaches. Your child learns chess and practises English simultaneously — no translation, no code-switching.",

  // ── Why Chess section ────────────────────────────────────────────────────────
  whyChessTitle: "Why Chess?",
  whyChessSub: "Chess builds skills that last a lifetime — and kids actually love it.",
  whyChess1Icon: "🧠",
  whyChess1Title: "Critical Thinking",
  whyChess1Desc: "Every move demands analysis and foresight. Kids learn to think 3 steps ahead and structure their reasoning.",
  whyChess2Icon: "⏳",
  whyChess2Title: "Patience & Discipline",
  whyChess2Desc: "Waiting, observing, and executing a long-term plan trains self-control more deeply than almost any other activity.",
  whyChess3Icon: "⚙️",
  whyChess3Title: "Logic & Strategy",
  whyChess3Desc: "Chess is pure logic made visible. Kids internalize cause-and-effect and build systematic thinking from an early age.",
  whyChess4Icon: "💪",
  whyChess4Title: "Psychological Resilience",
  whyChess4Desc: "Losing a game, reflecting, adapting, and coming back stronger builds the mental toughness kids need for life.",
  whyChess5Icon: "🎯",
  whyChess5Title: "Pressure Control",
  whyChess5Desc: "Performing under time pressure and real stakes teaches kids to stay calm and focused when it counts most.",
  whyChess6Icon: "🗣️",
  whyChess6Title: "English Immersion",
  whyChess6Desc: "All sessions are taught entirely in English. Chess vocabulary becomes natural spoken language — learning two skills at once.",

  // ── Testimonials ─────────────────────────────────────────────────────────────
  testimonialsTitle: "What Linkou Parents Say",
  testimonialsSub: "Real feedback from families in our community",
  testimonial1Quote: "My son was too shy to speak English. After two months here, he's explaining chess moves and asking questions confidently in English. It's been remarkable.",
  testimonial1Name: "Sarah L.",
  testimonial1Role: "Parent of an 8-year-old",
  testimonial2Quote: "The small group size is what sold us. The coach actually knows my daughter's weaknesses and works on them every single session.",
  testimonial2Name: "Kevin C.",
  testimonial2Role: "Parent of a 6-year-old",
  testimonial3Quote: "We tried a big cram school chess class and it felt like babysitting. Here the coach is structured, passionate, and my son makes visible progress every week.",
  testimonial3Name: "Michelle T.",
  testimonial3Role: "Parent of a 10-year-old",

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  faqTitle: "Parent FAQ",
  faqSub: "Common questions from Linkou families",
  faq1Q: "Is the entire lesson conducted in English?",
  faq1A: "Yes. Our coaches teach every session 100% in English. We use chess as the medium for natural English acquisition — no translation, no code-switching.",
  faq2Q: "What age is ideal to start?",
  faq2A: "We welcome kids from age 5 and up. Beginners at any age are warmly received — most students start with zero experience.",
  faq3Q: "How many students per session?",
  faq3A: "We keep groups small — typically 4 to 8 students per coach — so your child gets real, personalised attention every class.",
  faq4Q: "Does my child need their own chess set?",
  faq4A: "Not at all. We provide everything at the venue. If your child wants to practise at home, we're happy to recommend a set.",
  faq5Q: "What if my child has never touched a chess piece?",
  faq5A: "Most of our students start with zero experience. Our curriculum begins from the very basics and progresses at each child's individual pace.",

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
