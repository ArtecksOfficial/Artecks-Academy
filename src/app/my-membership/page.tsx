import L from "@/app/components/L";
import { Crown } from "lucide-react";
import MembershipLookup from "./MembershipLookup";

export const metadata = {
  title: "My Membership",
  description: "Check your Artecks Academy membership status by phone number.",
};

export default function MyMembershipPage() {
  return (
    <div
      className="min-h-screen bg-gray-50 px-4 py-12"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#13223F] to-[#2A4170] shadow-lg shadow-[#13223F]/10 mb-4">
            <Crown size={26} className="text-white" />
          </div>
          <h1 className="font-serif-tc text-2xl font-black text-gray-900"><L en="My Membership" zh="我的會員資格" /></h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-snug">
            <L en="Enter the phone number you used when subscribing to check your status." zh="輸入訂閱時使用的手機號碼，查詢會員狀態。" />
          </p>
        </div>

        <MembershipLookup />

        <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
          <L en="Member discounts are applied automatically when you book using your registered phone number." zh="使用註冊的手機號碼預約時，會自動套用會員折扣。" />
          <br />
          <L en="Need help? Contact your coach directly." zh="需要協助嗎？請直接聯絡你的教練。" />
        </p>
      </div>
    </div>
  );
}
