// ─── i18n Dictionaries ────────────────────────────────────────────────────────
// Flat key-value dictionary for zh-TW and en locales.
// Add keys here; TypeScript will enforce parity via `satisfies`.

export type Locale = "zh" | "en";

const zh = {
  // Brand
  brandName: "Artecks Academy",

  // ── Homepage ────────────────────────────────────────────────────────────────
  // Hero
  heroTitle1: "全英語西洋棋課",
  heroTitle2: "孩子真正愛上學習。",
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
  emptyTitle: "下一期即將開班，名額有限",
  emptyDesc: "留下資料，搶先獲得開班通知，會員享優先報名及折扣優惠。",

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

  // Static coach spotlight
  coachSpotlightTitle: "認識你的教練",
  coachSpotlightName: "Issac Chang",
  coachSpotlightCredential: "Artecks Academy 創辦人 · 英語授課教練",
  coachSpotlightBio: "Issac 熱愛西洋棋與英語教育，相信棋盤是培養孩子批判性思維最好的道具。每堂課全程英語授課，讓孩子在學棋的同時自然習得英語。",

  // Footer
  footerBook: "預約課程",
  footerBookings: "我的報名",

  // ── Trial CTA ───────────────────────────────────────────────────────────────
  trialBadge: "免費體驗",
  trialTitle: "不確定適不適合？先試一堂。",
  trialSub: "體驗課免費，60 分鐘，孩子將學會用棋盤將死對手。沒有壓力，沒有承諾。",
  trialCta: "預約免費體驗課",

  // ── Skill roadmap ───────────────────────────────────────────────────────────
  roadmapTitle: "清晰的學習路徑",
  roadmapSub: "從零開始到能打比賽，每個階段都有明確目標",
  roadmapL1Badge: "Level 1",
  roadmapL1Title: "棋盤入門",
  roadmapL1Desc: "棋子移動、將軍與將死、基本戰術",
  roadmapL1Skills: "棋子走法 · 將死 · 開局原則",
  roadmapL2Badge: "Level 2",
  roadmapL2Title: "戰術思維",
  roadmapL2Desc: "叉擊、釘子、串打、棋局分析",
  roadmapL2Skills: "叉擊 · 釘子 · 串打 · 計算力",
  roadmapL3Badge: "Level 3",
  roadmapL3Title: "策略與殘局",
  roadmapL3Desc: "開局系統、中盤計畫、殘局技巧",
  roadmapL3Skills: "開局系統 · 兵型 · 殘局",
  roadmapL4Badge: "Level 4",
  roadmapL4Title: "競賽準備",
  roadmapL4Desc: "比賽心理、時間管理、對局覆盤",
  roadmapL4Skills: "時間壓力 · 覆盤 · 比賽策略",

  // ── Anchor nav ──────────────────────────────────────────────────────────────
  navWhyChess: "為什麼學棋",
  navSessions: "近期課程",
  navTestimonials: "家長評價",
  navFaq: "常見問題",

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
  testimonial4Quote: "教練用英語解釋每一步棋，孩子回家還會教我們英文單字。太神奇了。",
  testimonial4Name: "Amy W.",
  testimonial4Role: "7歲孩子的媽媽",
  testimonial5Quote: "孩子本來很內向，上了幾堂課後開始主動分析棋局，信心完全不一樣了。",
  testimonial5Name: "Jason H.",
  testimonial5Role: "9歲孩子的爸爸",
  testimonial6Quote: "第一堂試課就愛上了。教練很有耐心，孩子每次都期待上課。",
  testimonial6Name: "Linda C.",
  testimonial6Role: "6歲孩子的媽媽",
  testimonial7Quote: "在這裡學棋讓孩子養成了思考的習慣，做功課也變得更專注。",
  testimonial7Name: "David K.",
  testimonial7Role: "11歲孩子的爸爸",
  testimonial8Quote: "全英語環境讓孩子自然而然地進步，不像補習班那麼有壓力。",
  testimonial8Name: "Tina L.",
  testimonial8Role: "8歲孩子的媽媽",
  testimonial9Quote: "教練每堂課都有主題，孩子學得很紮實，棋力進步明顯。",
  testimonial9Name: "Mark S.",
  testimonial9Role: "10歲孩子的爸爸",
  testimonial10Quote: "報名之前很擔心孩子英文不夠好，但教練很有技巧地讓孩子融入，現在完全沒問題。",
  testimonial10Name: "Grace Y.",
  testimonial10Role: "7歲孩子的媽媽",

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

  // LINE Contact
  lineTitle: "加入我們的 LINE 群組",
  lineSub: "有問題或想報名？直接在 LINE 上聯繫我們。",
  lineClubLabel: "♟ 棋藝俱樂部",
  lineClubDesc: "課程公告、學員分享、比賽資訊",
  linePrivateLabel: "👤 私人課程諮詢",
  linePrivateDesc: "一對一排課、課程規劃、費用詢問",
  lineJoin: "加入群組",
};

const en: typeof zh = {
  // Brand
  brandName: "Artecks Academy",

  // ── Homepage ────────────────────────────────────────────────────────────────
  // Hero
  heroTitle1: "English-Immersion Chess",
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
  emptyTitle: "Next cohort forming — spots limited",
  emptyDesc: "Join the waitlist to be first in line when booking opens. Members get priority access and a discount on every session.",

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

  // Static coach spotlight
  coachSpotlightTitle: "Meet Your Coach",
  coachSpotlightName: "Issac Chang",
  coachSpotlightCredential: "Founder, Artecks Academy · English-Instruction Coach",
  coachSpotlightBio: "Issac combines a passion for chess with a belief that the board is the best tool for building critical thinking in kids. Every session is conducted entirely in English — so children level up in chess and language at the same time.",

  // Footer
  footerBook: "Book a Session",
  footerBookings: "My Bookings",

  // ── Trial CTA ───────────────────────────────────────────────────────────────
  trialBadge: "Free Trial",
  trialTitle: "Not sure yet? Try one class.",
  trialSub: "One free 60-minute trial lesson. Your child will learn to checkmate an opponent before the session ends. No pressure, no commitment.",
  trialCta: "Book a Free Trial",

  // ── Skill roadmap ───────────────────────────────────────────────────────────
  roadmapTitle: "A clear path forward",
  roadmapSub: "From absolute beginner to tournament-ready — every stage has a goal",
  roadmapL1Badge: "Level 1",
  roadmapL1Title: "The Basics",
  roadmapL1Desc: "How pieces move, check and checkmate, opening principles",
  roadmapL1Skills: "Piece movement · Checkmate · Opening rules",
  roadmapL2Badge: "Level 2",
  roadmapL2Title: "Tactical Thinking",
  roadmapL2Desc: "Forks, pins, skewers, and reading the board ahead",
  roadmapL2Skills: "Forks · Pins · Skewers · Calculation",
  roadmapL3Badge: "Level 3",
  roadmapL3Title: "Strategy & Endgame",
  roadmapL3Desc: "Opening systems, middlegame plans, endgame technique",
  roadmapL3Skills: "Opening systems · Pawn structure · Endgame",
  roadmapL4Badge: "Level 4",
  roadmapL4Title: "Tournament Ready",
  roadmapL4Desc: "Match psychology, time management, game analysis",
  roadmapL4Skills: "Clock pressure · Analysis · Match strategy",

  // ── Anchor nav ──────────────────────────────────────────────────────────────
  navWhyChess: "Why Chess",
  navSessions: "Sessions",
  navTestimonials: "Reviews",
  navFaq: "FAQ",

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
  testimonial4Quote: "The coach explains every move in English. My son comes home teaching us chess vocabulary — it's incredible.",
  testimonial4Name: "Amy W.",
  testimonial4Role: "Parent of 7-year-old",
  testimonial5Quote: "My shy daughter started analyzing positions out loud after just a few lessons. The confidence boost is real.",
  testimonial5Name: "Jason H.",
  testimonial5Role: "Parent of 9-year-old",
  testimonial6Quote: "My son was hooked after the first trial class. The coach is incredibly patient and he looks forward to every session.",
  testimonial6Name: "Linda C.",
  testimonial6Role: "Parent of 6-year-old",
  testimonial7Quote: "Chess here has taught my son to slow down and think. His focus during homework has improved noticeably.",
  testimonial7Name: "David K.",
  testimonial7Role: "Parent of 11-year-old",
  testimonial8Quote: "The all-English environment helps my daughter improve naturally — much less stressful than a cram school.",
  testimonial8Name: "Tina L.",
  testimonial8Role: "Parent of 8-year-old",
  testimonial9Quote: "Every class has a clear theme. My son's chess level has improved steadily and visibly.",
  testimonial9Name: "Mark S.",
  testimonial9Role: "Parent of 10-year-old",
  testimonial10Quote: "I was worried his English wasn't good enough, but the coach found ways to include him from day one. No issues now.",
  testimonial10Name: "Grace Y.",
  testimonial10Role: "Parent of 7-year-old",

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

  // LINE Contact
  lineTitle: "Join Our LINE Groups",
  lineSub: "Questions or ready to sign up? Reach us directly on LINE.",
  lineClubLabel: "♟ Chess Club",
  lineClubDesc: "Class announcements, student updates, tournament news",
  linePrivateLabel: "👤 Private Lessons",
  linePrivateDesc: "One-on-one scheduling, lesson planning, pricing enquiries",
  lineJoin: "Join Group",
};

export const dictionaries = { zh, en } satisfies Record<Locale, Record<string, string>>;
export type DictionaryKey = keyof typeof zh;
