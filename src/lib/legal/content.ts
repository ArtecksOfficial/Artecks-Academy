// ─── Policy text: privacy, terms, refunds (zh-TW and English) ─────────────────
// DRAFT for the owner to review before LEGAL_PUBLISHED is switched on. Not legal
// advice. Lines marked DECISION in comments are business rules the owner must confirm.

export interface Bi { zh: string; en: string }
export interface LegalSection { heading: Bi; body: Bi[] }
export interface LegalDoc { title: Bi; intro: Bi; sections: LegalSection[] }
export type LegalSlug = "privacy" | "terms" | "refund";

const privacy: LegalDoc = {
  title: { zh: "隱私權政策", en: "Privacy Policy" },
  intro: {
    zh: "Artecks Academy（以下稱「我們」）提供兒童與青少年的英語西洋棋課程。本政策依《個人資料保護法》說明我們蒐集哪些個人資料、為什麼蒐集、如何使用，以及您可以行使的權利。",
    en: "Artecks Academy (\"we\") runs English-language chess lessons for children and teenagers. This policy explains, in line with Taiwan's Personal Data Protection Act, what personal data we collect, why, how we use it, and the rights you have.",
  },
  sections: [
    {
      heading: { zh: "一、我們蒐集的資料", en: "1. What we collect" },
      body: [
        { zh: "家長或監護人：姓名、電話、LINE ID 或其他聯絡方式、Email，以及您使用 LINE 登入時 LINE 提供的顯示名稱與使用者識別碼。", en: "Parents and guardians: name, phone number, LINE ID or other contact detail, email, and, if you log in with LINE, the display name and user identifier LINE gives us." },
        { zh: "學生：姓名或暱稱、年齡或出生年、西洋棋程度、上課地區偏好，以及您在備註中提供的資訊。", en: "Students: name or nickname, age or birth year, chess level, preferred lesson area, and anything you tell us in the notes field." },
        { zh: "上課與學習紀錄：預約與出席紀錄、教練的課後報告與作業、經驗值（XP）與寶石、排行榜暱稱（僅在家長選擇加入時顯示）、您填寫的課後回饋。", en: "Lesson and learning records: bookings and attendance, coach reports and homework, XP and gems, a leaderboard nickname (shown only if a parent opts in), and the feedback you submit after lessons." },
        { zh: "付款資料：付款方式、金額與狀態；以銀行轉帳付款時，您回報的帳號末五碼。信用卡資料由金流服務商（綠界 ECPay）處理，我們不會取得或保存完整卡號。", en: "Payment records: method, amount and status; for bank transfers, the last five digits of the account you report. Card details are handled by our payment provider (ECPay); we never receive or store full card numbers." },
        { zh: "網站使用資料：瀏覽的頁面、來源頁面與基本的裝置資訊，用於了解網站使用情況。", en: "Site usage: pages viewed, the referring page and basic device information, used to understand how the site is used." },
      ],
    },
    {
      heading: { zh: "二、蒐集目的", en: "2. Why we collect it" },
      body: [
        { zh: "安排與提供課程（含指派教練、通知上課時間與地點）、處理付款與退款、提供課後報告與作業、計算與發放 XP 及寶石、回覆您的詢問、履行法律義務，以及改善我們的服務。", en: "To arrange and deliver lessons (including assigning a coach and telling you the time and place), take payments and make refunds, provide lesson reports and homework, calculate and award XP and gems, answer your questions, meet our legal obligations, and improve our service." },
        { zh: "我們不會將您的個人資料出售給任何人，也不會用於與課程無關的行銷。", en: "We do not sell your personal data, and we do not use it for marketing unrelated to the lessons." },
      ],
    },
    {
      heading: { zh: "三、利用期間、地區、對象與方式", en: "3. How long, where, and who sees it" },
      body: [
        { zh: "期間：於您的帳號存續期間及其後依法令須保存的期間內利用。", en: "Period: for as long as your account exists, and afterwards for as long as the law requires us to keep records." },
        { zh: "對象：被指派授課的教練會看到學生的姓名、程度與上課紀錄，並在預約成立後看到家長的 LINE 聯絡方式，以便聯繫上課事宜。", en: "Recipients: the coach assigned to your child sees the student's name, level and lesson records, and, once a lesson is booked, the parent's LINE contact so they can coordinate the lesson." },
        { zh: "我們使用下列服務商協助營運，它們僅能依我們的指示處理資料：網站與資料庫代管（Vercel、Railway）、金流（綠界 ECPay）、登入與訊息（LINE）、電子郵件寄送（SendGrid）。部分服務商的伺服器位於臺灣以外的地區。", en: "We use these providers to run the service, and they may process data only on our instructions: hosting and database (Vercel, Railway), payments (ECPay), login and messaging (LINE), and email delivery (SendGrid). Some of their servers are outside Taiwan." },
        { zh: "除上述情形、取得您的同意或依法令要求外，我們不會將您的資料提供給第三人。", en: "Beyond this, we share your data only with your consent or where the law requires it." },
      ],
    },
    {
      heading: { zh: "四、兒童與青少年的資料", en: "4. Children's and teenagers' data" },
      body: [
        { zh: "未滿 13 歲的學生不能自行註冊帳號，只能由家長或監護人在自己的帳號下建立學生檔案。13 至 17 歲的學生須經家長或監護人同意，才能建立自己的帳號。", en: "Students under 13 cannot register on their own; a parent or guardian creates a student profile under their own account. Students aged 13 to 17 need a parent's or guardian's agreement to have their own account." },
        { zh: "學生是否出現在排行榜、以及顯示的暱稱，由家長決定，並可隨時在「設定」中變更。", en: "Whether a student appears on the leaderboard, and under what nickname, is the parent's choice and can be changed at any time in Settings." },
      ],
    },
    {
      heading: { zh: "五、您的權利", en: "5. Your rights" },
      body: [
        { zh: "依《個人資料保護法》第三條，您可以就您本人及您子女的個人資料，向我們請求：查詢或閱覽、製給複製本、補充或更正、停止蒐集、處理或利用，以及刪除。", en: "Under Article 3 of the Personal Data Protection Act you may ask us, for your own data and your child's, to: let you see it, give you a copy, add to or correct it, stop collecting, processing or using it, and delete it." },
        { zh: "請透過本頁下方的聯絡方式提出，我們會在確認您的身分後儘速處理。依法令須保存的紀錄（例如交易紀錄）可能無法立即刪除。", en: "Contact us using the details at the bottom of this page and we will act promptly once we have confirmed who you are. Records we are legally required to keep, such as transaction records, may not be deletable straight away." },
      ],
    },
    {
      heading: { zh: "六、不提供資料的影響", en: "6. If you choose not to provide data" },
      body: [
        { zh: "您可以自由選擇是否提供個人資料。但若未提供預約所需的資料（例如聯絡方式與學生姓名），我們將無法為您安排課程。", en: "Providing personal data is your choice. Without the details a booking needs, such as a contact method and the student's name, we cannot arrange lessons for you." },
      ],
    },
    {
      heading: { zh: "七、Cookie 與瀏覽器儲存", en: "7. Cookies and browser storage" },
      body: [
        { zh: "我們在您的瀏覽器中儲存登入狀態與語言選擇，讓網站正常運作。我們不使用廣告追蹤工具。", en: "We store your login state and language choice in your browser so the site works. We do not use advertising trackers." },
      ],
    },
    {
      heading: { zh: "八、資料安全與政策變更", en: "8. Security and changes to this policy" },
      body: [
        { zh: "我們採取合理的技術與管理措施保護您的資料，包括加密傳輸與限制存取權限。若發生影響您資料的安全事故，我們會依法通知您。", en: "We take reasonable technical and organisational steps to protect your data, including encrypted connections and restricted access. If a security incident affects your data, we will notify you as the law requires." },
        { zh: "本政策如有重大變更，我們會在網站上公告，並更新生效日期。", en: "If we make a significant change to this policy, we will post a notice on the site and update the effective date." },
      ],
    },
  ],
};

const terms: LegalDoc = {
  title: { zh: "服務條款", en: "Terms of Service" },
  intro: {
    zh: "歡迎使用 Artecks Academy。當您註冊帳號、預約或購買課程時，即表示您同意以下條款。若您是為子女預約，表示您是該名學生的家長或監護人。",
    en: "Welcome to Artecks Academy. By creating an account, or booking or buying lessons, you agree to these terms. If you book for a child, you confirm you are that student's parent or guardian.",
  },
  sections: [
    {
      heading: { zh: "一、我們提供的服務", en: "1. What we provide" },
      body: [
        { zh: "我們提供以英語授課的西洋棋課程，包含一對一、一對二與小班課程，以及相關的線上練習與學習紀錄。", en: "We provide chess lessons taught in English, as one-to-one, one-to-two and small-group classes, together with online practice and learning records." },
        { zh: "您在網站上預約時段後，由我們依學生的年齡、程度與上課地點指派教練；一對二與小班課程依年齡與程度分組。上課地點會在預約確認時告知。", en: "After you book a time on the site, we assign a coach based on the student's age, level and location; one-to-two and group classes are matched by age and level. We confirm the lesson location when the booking is confirmed." },
      ],
    },
    {
      heading: { zh: "二、帳號", en: "2. Accounts" },
      body: [
        { zh: "帳號由家長或監護人持有，學生檔案建立在家長帳號之下。請提供正確的資料，並妥善保管您的密碼與兒童模式的家長 PIN 碼；經由您的帳號所進行的操作，視為您本人所為。", en: "Accounts belong to a parent or guardian, with student profiles kept under the parent's account. Please give accurate details and keep your password and the Kid Mode parent PIN safe; actions taken through your account are treated as yours." },
        { zh: "13 至 17 歲的學生經家長或監護人同意後，可以擁有自己的帳號，並連結至家長的家庭錢包。", en: "Students aged 13 to 17 may have their own account with a parent's or guardian's agreement, and can link it to the parent's family wallet." },
      ],
    },
    {
      heading: { zh: "三、價格與付款", en: "3. Prices and payment" },
      body: [
        { zh: "課程與套票的價格以網站上付款前顯示的新臺幣金額為準。您可以透過綠界 ECPay 線上付款，或以銀行轉帳至網站上顯示的 Artecks Academy 帳戶。", en: "The price of a lesson or package is the New Taiwan dollar amount shown on the site before you pay. You can pay online through ECPay, or by bank transfer to the Artecks Academy account shown on the site." },
        { zh: "請勿將學費直接交付給個別教練。", en: "Please do not pay tuition directly to an individual coach." },
      ],
    },
    {
      heading: { zh: "四、XP 與寶石", en: "4. XP and gems" },
      body: [
        { zh: "XP 用於排行榜與學習進度，沒有金錢價值。", en: "XP is used for the leaderboard and progress tracking and has no monetary value." },
        { zh: "寶石是折扣點數，可依網站上顯示的規則折抵課程套票的部分金額。寶石不具現金價值，不得兌換現金、轉讓或買賣。", en: "Gems are discount points that can reduce part of the price of a lesson package, under the rules shown on the site. Gems have no cash value and cannot be exchanged for cash, transferred or traded." },
        { zh: "我們可能調整 XP 與寶石的取得與使用規則，調整前會在網站上公告。以不正當方式（例如利用程式或漏洞）取得的 XP 或寶石，我們得予以扣除。", en: "We may adjust how XP and gems are earned and used, and will post a notice on the site before we do. XP or gems obtained improperly, for example with scripts or by exploiting a bug, may be removed." },
      ],
    },
    {
      heading: { zh: "五、取消、改期與退款", en: "5. Cancellations, rescheduling and refunds" },
      body: [
        { zh: "取消、改期與退款依我們的《退款政策》辦理。", en: "Cancellations, rescheduling and refunds follow our Refund Policy." },
      ],
    },
    {
      heading: { zh: "六、回饋與排行榜", en: "6. Feedback and the leaderboard" },
      body: [
        { zh: "您提交的課後回饋會以匿名方式提供給教練，用於改善教學品質。排行榜僅顯示家長選擇公開的暱稱。請勿使用不雅或冒用他人的暱稱。", en: "Feedback you submit after a lesson is passed to coaches anonymously to improve teaching. The leaderboard shows only the nickname a parent has chosen to make public. Please do not use nicknames that are offensive or impersonate someone else." },
      ],
    },
    {
      heading: { zh: "七、消費者權益", en: "7. Your rights as a consumer" },
      body: [
        { zh: "本條款不限制您依《消費者保護法》及其他法令所享有的權利。本條款未規定的事項，依中華民國法令辦理。", en: "Nothing in these terms limits the rights you have under the Consumer Protection Act and other laws. Matters these terms do not cover are governed by the laws of the Republic of China (Taiwan)." },
      ],
    },
    {
      heading: { zh: "八、條款變更", en: "8. Changes to these terms" },
      body: [
        { zh: "我們修改本條款時會在網站上公告並更新生效日期。變更不影響您在變更前已付款的課程。", en: "When we change these terms we will post a notice on the site and update the effective date. Changes do not affect lessons you paid for before the change." },
      ],
    },
  ],
};

const refund: LegalDoc = {
  title: { zh: "退款政策", en: "Refund Policy" },
  intro: {
    zh: "本政策適用於在 Artecks Academy 預約或購買的課程與課程套票。您依《消費者保護法》所享有的權利，不因本政策而受限制。",
    en: "This policy covers lessons and lesson packages booked or bought from Artecks Academy. It does not limit the rights you have under the Consumer Protection Act.",
  },
  sections: [
    {
      heading: { zh: "一、上課前取消或改期", en: "1. Cancelling or rescheduling before a lesson" },
      body: [
        // DECISION: is any notice period required (e.g. 24 hours)? The draft assumes none.
        { zh: "在課程開始前取消的，您可以選擇全額退款或免費改期，不收取手續費。", en: "If you cancel before a lesson starts, you can choose a full refund or a free reschedule. There is no fee." },
        // DECISION: how are no-shows treated? The draft counts them as used.
        { zh: "未事先通知而缺席的課程，視為已使用。", en: "A lesson missed without telling us beforehand counts as used." },
      ],
    },
    {
      heading: { zh: "二、課程套票", en: "2. Lesson packages" },
      body: [
        { zh: "套票尚未使用任何一堂課的，可申請全額退款。", en: "A package with no lessons used can be refunded in full." },
        { zh: "已開始使用的套票，我們會依已上課的堂數按套票的每堂價格扣除後，退還其餘未使用堂數的費用。", en: "For a package that has been started, we deduct the lessons already taken at the package's per-lesson price and refund the rest." },
        // DECISION: gems earned from refunded lessons are removed (matches the open "Refund → revoke gems" task).
        { zh: "因退款的課程而取得的寶石將一併扣回。", en: "Gems earned from lessons that are refunded are removed." },
      ],
    },
    {
      heading: { zh: "三、由我們取消或改期", en: "3. If we cancel or reschedule" },
      body: [
        { zh: "因我們或教練的因素而取消或改期時，您可以選擇全額退還該堂課的費用，或免費改期。", en: "If a lesson is cancelled or moved because of us or the coach, you can choose a full refund for that lesson or a free reschedule." },
      ],
    },
    {
      heading: { zh: "四、退款方式與期限", en: "4. How and when refunds are paid" },
      body: [
        { zh: "我們會在收到退款申請之次日起十五日內完成退款，不收取退款手續費。", en: "We complete refunds within fifteen days, counted from the day after we receive your request, and charge no refund fee." },
        { zh: "以信用卡付款的，退回原信用卡，實際入帳時間依發卡銀行作業而定。以 ATM、超商代碼或銀行轉帳付款的，我們會請您提供退款帳戶後匯款。", en: "Card payments are refunded to the original card; when it appears depends on your card issuer. For ATM, convenience-store or bank-transfer payments, we ask you for an account and send the refund by transfer." },
      ],
    },
    {
      heading: { zh: "五、如何申請", en: "5. How to ask for a refund" },
      body: [
        { zh: "請透過本頁下方的聯絡方式告訴我們，並提供家長姓名、學生姓名與要退款的課程或套票。", en: "Contact us using the details at the bottom of this page with the parent's name, the student's name, and the lesson or package you want refunded." },
      ],
    },
    {
      heading: { zh: "六、爭議處理", en: "6. Disputes" },
      body: [
        { zh: "如有任何爭議，請先與我們聯繫，我們會在收到申訴之日起十五日內處理。您也可以撥打 1950 全國消費者服務專線，或向所在地縣市政府的消費者服務中心提出申訴。", en: "If you have a dispute, please contact us first and we will respond within fifteen days of receiving your complaint. You may also call the national consumer hotline on 1950 or complain to your city or county Consumer Service Center." },
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = { privacy, terms, refund };
