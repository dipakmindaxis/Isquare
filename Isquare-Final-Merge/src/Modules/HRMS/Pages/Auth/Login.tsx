import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import logoImg from "../../../../assets/isquare-logo.png";
import loginBg from "../../../../assets/login-bg1.png";

// Safety Equipment Icons (exact match to reference)
import headProtectionIcon from "../../../../assets/safety-icons/head-protection.png";
import eyeProtectionIcon from "../../../../assets/safety-icons/eye-protection.png";
import handProtectionIcon from "../../../../assets/safety-icons/hand-protection.png";
import safetyApparelIcon from "../../../../assets/safety-icons/safety-apparel.png";
import safetyFootwearIcon from "../../../../assets/safety-icons/safety-footwear.png";
import fireSafetyIcon from "../../../../assets/safety-icons/fire-safety.png";
import industrialSafetyIcon from "../../../../assets/safety-icons/industrial-safety.png";
import workplaceSafetyIcon from "../../../../assets/safety-icons/workplace-safety.png";

interface SafetyEquipmentItem {
  id: string;
  name: string;
  icon: string;
}

const safetyItems: SafetyEquipmentItem[] = [
  // Row 1
  { id: "head", name: "Head Protection", icon: headProtectionIcon },
  { id: "eye", name: "Eye Protection", icon: eyeProtectionIcon },
  { id: "hand", name: "Hand Protection", icon: handProtectionIcon },
  { id: "apparel", name: "Safety Apparel", icon: safetyApparelIcon },
  // Row 2
  { id: "footwear", name: "Safety Footwear", icon: safetyFootwearIcon },
  { id: "fire", name: "Fire Safety", icon: fireSafetyIcon },
  { id: "industrial", name: "Industrial Safety", icon: industrialSafetyIcon },
  { id: "workplace", name: "Workplace Safety", icon: workplaceSafetyIcon },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("isquare_remember_email") || "";
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem("isquare_remember_email");
    return saved !== null ? true : true;
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      toast.success("Logged in successfully!");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem("isquare_remember_email", email.trim());
      } else {
        localStorage.removeItem("isquare_remember_email");
      }

      await login(email, password);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 font-['Poppins',sans-serif] relative selection:bg-[#FF7900] selection:text-white"
    >
      {/* Centered Main Container with tightened spacing */}
      <div className="w-full max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-stretch">
        {/* ========================================================= */}
        {/* LEFT SECTION: Heading, Subtitle & 8 Safety-Equipment Tiles */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center text-left py-2 lg:py-4 -translate-y-2 sm:-translate-y-4 lg:-translate-y-6">
          {/* Main Heading: "Sign in to your" in navy, "Workspace" in orange */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight leading-[1.1] mb-3 text-[#0B2D55]">
            Sign in to your <br className="hidden sm:inline" />
            <span className="text-[#FF7900]">Workspace</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-[#4C627D] text-sm sm:text-[16px] font-normal leading-[1.55] max-w-[420px]">
            Access CRM, Visitor Management, HRMS and more. Let&apos;s build a safer
            workplace together.
          </p>

          {/* Short Thin Orange Underline */}
          <div className="w-12 h-1 bg-[#FF7900] rounded-full mt-3.5 mb-6 sm:mb-8" />

          {/* 4-column × 2-row Safety Equipment Tiles Grid (compact size) */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-[360px] sm:max-w-[380px]">
            {safetyItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center group cursor-default"
              >
                {/* Rounded Icon Tile Card (reduced size) */}
                <div className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] bg-white/80 hover:bg-white rounded-[15px] sm:rounded-[17px] border border-[#D5E4F3] hover:border-[#A8CBEB] shadow-[0_3px_10px_rgba(11,45,85,0.04)] hover:shadow-[0_6px_16px_rgba(11,45,85,0.08)] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center p-2 sm:p-2.5">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>

                {/* Label Underneath */}
                <span className="text-[#0B2D55] font-semibold text-[10.5px] sm:text-[11.5px] text-center mt-1.5 leading-tight tracking-tight px-0.5">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION: White Login Panel + Copyright Footer       */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center w-full">
          {/* White Login Card (compact width & comfortable padding) */}
          <div className="w-full max-w-[450px] sm:max-w-[465px] bg-white rounded-[26px] sm:rounded-[30px] shadow-[0_20px_50px_rgba(11,45,85,0.08)] p-6 sm:p-9 lg:p-10 border border-white/90 transition-all duration-300">
            {/* Center Logo */}
            <div className="mb-5 sm:mb-6 flex justify-center w-full">
              <img
                src={logoImg}
                alt="iSQUARE Safety Equipments Pvt. Ltd"
                className="h-11 sm:h-12 w-auto object-contain max-w-[210px]"
              />
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center mb-7">
              <h2 className="text-[28px] sm:text-[30px] font-bold text-[#0B2D55] tracking-tight leading-tight">
                Welcome Back
              </h2>
              <p className="text-[#62758D] text-sm sm:text-[14.5px] font-normal mt-1.5">
                Sign in to your workspace
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-4.5">
              {/* Email Input Field */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-[#62758D]">
                  <Mail className="w-[19px] h-[19px] stroke-[2]" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="isquare@gmail.com"
                  autoComplete="email"
                  className="w-full h-[52px] sm:h-[54px] pl-12 pr-4 bg-[#F0F5FA] hover:bg-[#EAF1F8] focus:bg-white border border-[#E0EBF5] focus:border-[#0B2D55] rounded-[16px] text-[#0B2D55] text-sm font-medium placeholder:text-[#8E9FBA] focus:outline-none focus:ring-2 focus:ring-[#0B2D55]/10 transition-all duration-200"
                />
              </div>

              {/* Password Input Field */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-[#62758D]">
                  <Lock className="w-[19px] h-[19px] stroke-[2]" />
                </span>
                <input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full h-[52px] sm:h-[54px] pl-12 pr-12 bg-[#F0F5FA] hover:bg-[#EAF1F8] focus:bg-white border border-[#E0EBF5] focus:border-[#0B2D55] rounded-[16px] text-[#0B2D55] text-sm font-medium placeholder:text-[#8E9FBA] focus:outline-none focus:ring-2 focus:ring-[#0B2D55]/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-[#62758D] hover:text-[#0B2D55] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  {isPasswordVisible ? (
                    <EyeOff className="w-[19px] h-[19px] stroke-[2]" />
                  ) : (
                    <Eye className="w-[19px] h-[19px] stroke-[2]" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 pb-2 px-1 text-xs sm:text-[13.5px]">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-[#0B2D55] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0B2D55] accent-[#0B2D55] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#0B2D55] hover:text-[#FF7900] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] sm:h-[56px] bg-[#082B50] hover:bg-[#06203c] active:scale-[0.99] text-white font-semibold text-base rounded-[18px] sm:rounded-[20px] shadow-[0_8px_20px_rgba(8,43,80,0.25)] hover:shadow-[0_10px_24px_rgba(8,43,80,0.32)] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.3]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Copyright Beneath the Panel */}
          <footer className="mt-6 sm:mt-7 text-center px-4">
            <p className="text-xs sm:text-[13px] text-[#62758D] font-normal tracking-wide">
              &copy; 2026 <span className="font-medium text-[#0B2D55]">iSquare Safety Equipments Pvt. Ltd</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
