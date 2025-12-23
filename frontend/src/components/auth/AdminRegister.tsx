import { useDispatch } from "react-redux";
import { register } from "../../Redux/slices/authSlice";
// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { AppDispatch } from "../../Redux/store";

export default function AdminRegister() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Check access code
    const accessCode = String(formData.get("accessCode") || "");
    if (accessCode !== "ADMIN123") {
      toast.error("Invalid access code");
      return;
    }

    const rawPhone = String(formData.get("phone") || "");
    const phone = rawPhone.replace(/\D/g, "");
    if (phone.length < 10 || phone.length > 15) {
      toast.error("Enter a valid phone number");
      return;
    }

    const result = await dispatch(
      register({
        name: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim().toLowerCase(),
        phone,
        password: String(formData.get("password")),
        role: "ADMIN",
      })
    );

    if (register.fulfilled.match(result)) {
      toast.success("Admin account created! Please verify your email.");
      navigate("/verify-otp");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Registration
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create an administrator account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              placeholder="Administrator Name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="admin@bishwassetu.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              placeholder="98XXXXXXXX"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Access Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              name="accessCode"
              type="password"
              placeholder="Enter admin access code"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Access code: ADMIN123 (for testing)
            </p>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition duration-200"
          >
            Create Admin Account
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span className="text-red-600 hover:underline cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
