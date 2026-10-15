import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import ISquareLogo from "../../../../Components/Common/ISquareLogo";
import { resetPassword } from "./AuthService";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const rawQuery = window.location.search;
    const tokenMatch = rawQuery.match(/token=([^&]+)/);
    const rawToken = tokenMatch
      ? decodeURIComponent(tokenMatch[1])
      : null;
    if (!rawToken || !emailParam) {
      toast.error("Invalid or missing reset token/email.");
      navigate("/login");
    } else {
      setToken(rawToken);
      setEmail(emailParam);
    }
  }, [searchParams, navigate]);

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!token || !email) {
      toast.error("Missing required information for password reset.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({
        email,
        token,
        newPassword: password,
      });
      toast.success(response.message);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00142b] via-[#001d3d] to-[#0a1526] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-4 border border-white/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">
            Password Reset Successful
          </h2>
          <p className="text-gray-500 text-sm">
            You can now sign in with your new password.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="w-full flex justify-center py-2.5 px-4 bg-gradient-to-r from-[#00234a] to-[#003366] hover:from-[#001a38] hover:to-[#002e61] text-white rounded-xl font-bold text-sm shadow-md"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00142b] via-[#001d3d] to-[#0a1526] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
        <div className="text-center flex flex-col items-center">
          <ISquareLogo size="xl" theme="dark" className="mb-4 max-w-[260px]" />
          <h2 className="text-2xl font-bold text-slate-800">Set New Password</h2>
          <p className="text-slate-500 text-xs mt-1">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={isPasswordVisible ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={isPasswordVisible ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-[#00234a] to-[#003366] hover:from-[#001a38] hover:to-[#002e61] text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-blue-200/60">
        © {new Date().getFullYear()} iSquare Safety Equipments Pvt. Ltd. All rights reserved.
      </p>
    </div>
  );
};

export default ResetPassword;
