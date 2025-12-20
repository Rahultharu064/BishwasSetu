import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOTP, resendOTP } from "../../Redux/slices/authSlice";
import type { RootState } from "../../Redux/store";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { AppDispatch } from "../../Redux/store";

export default function VerifyOtp() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    if (!userId) {
      toast.error("Please register first.");
      navigate("/register");
    }
  }, [userId, navigate]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID not found. Please register again.");
      navigate("/register");
      return;
    }
    const form = e.currentTarget as HTMLFormElement & { otp: { value: string } };
    const rawOtp = (form.otp.value || "").trim();
    const otp = rawOtp.replace(/\D/g, "");
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    const cleanUserId = String(userId).replace(/\D/g, "");
    if (!cleanUserId) {
      toast.error("Invalid user reference. Please register again.");
      navigate("/register");
      return;
    }
    const result = await dispatch(
      verifyOTP({
        userId: cleanUserId,
        otp,
      })
    );

    if (verifyOTP.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  const handleResend = async () => {
    if (!userId) {
      toast.error("User ID not found. Please register again.");
      navigate("/register");
      return;
    }
    await dispatch(resendOTP(userId));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the OTP sent to your email
          </p>
        </div>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP
            </label>
            <input
              name="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition duration-200"
          >
            Verify OTP
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition duration-200"
          >
            Resend OTP
          </button>
        </form>
      </div>
    </div>
  );
}
