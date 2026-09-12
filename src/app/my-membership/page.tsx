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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 mb-4">
            <Crown size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">My Membership</h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-snug">
            Enter the phone number you used when subscribing to check your status.
          </p>
        </div>

        <MembershipLookup />

        <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
          Member discounts are applied automatically when you book using your registered phone number.
          <br />
          Need help? Contact your coach directly.
        </p>
      </div>
    </div>
  );
}
