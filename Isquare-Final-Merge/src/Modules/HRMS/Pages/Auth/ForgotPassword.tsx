import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import ISquareLogo from "../../../../Components/Common/ISquareLogo";
import { forgotPassword } from "./AuthService";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.message);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00142b] via-[#001d3d] to-[#0a1526] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">
              Check your email
            </h2>
            <p className="text-gray-500 text-sm">
              If an account with the email{" "}
              <span className="font-semibold text-gray-700">{email}</span> exists,
              we have sent password reset instructions.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center flex flex-col items-center">
              <ISquareLogo size="xl" theme="dark" className="mb-4 max-w-[260px]" />
              <h2 className="text-2xl font-bold text-slate-800">
                Forgot Password?
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Enter your registered email to receive reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-[#00234a] to-[#003366] hover:from-[#001a38] hover:to-[#002e61] text-white rounded-xl font-bold text-sm shadow-md shadow-[#00234a]/20 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-xs text-blue-200/60">
        © {new Date().getFullYear()} iSquare Safety Equipments Pvt. Ltd. All rights reserved.
      </p>
    </div>
  );
};

export default ForgotPassword;
