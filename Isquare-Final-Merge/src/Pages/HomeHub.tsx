import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Database, ArrowRight, Phone, Mail } from "lucide-react";
import ISquareLogo from "../Components/Common/ISquareLogo";
import bgImage from "../assets/option-bg1.png";

// Option 1 Select Workspace Hub - clean background behind logo
interface ModuleCard {
  id: string;
  title: string;
  description: string;
  accentColor: string;
  iconBg: string;
  arrowBg: string;
  arrowShadow: string;
  hoverArrowShadow: string;
  icon: React.ReactNode;
}

const HomeHub: React.FC = () => {
  const navigate = useNavigate();

  const modules: ModuleCard[] = [
    {
      id: "rsm",
      title: "Customer Relationship Management (CRM)",
      description: "Manage clients, enquiries, sales and customer relationships.",
      accentColor: "#2878F0",
      iconBg: "#EAF3FF",
      arrowBg: "#2878F0",
      arrowShadow: "shadow-[0_4px_14px_rgba(40,120,240,0.35)]",
      hoverArrowShadow: "group-hover:shadow-[0_6px_18px_rgba(40,120,240,0.45)]",
      icon: <Briefcase className="w-7 h-7 text-[#2878F0] stroke-[2.2]" />,
    },
    {
      id: "vms",
      title: "Visitor Management System (VMS)",
      description: "Manage visitors, entries, passes and visitor records.",
      accentColor: "#EF3D5B",
      iconBg: "#FFF0F2",
      arrowBg: "#EF3D5B",
      arrowShadow: "shadow-[0_4px_14px_rgba(239,61,91,0.35)]",
      hoverArrowShadow: "group-hover:shadow-[0_6px_18px_rgba(239,61,91,0.45)]",
      icon: <Database className="w-7 h-7 text-[#EF3D5B] stroke-[2.2]" />,
    },
    {
      id: "hrms",
      title: "HRMS & Payroll",
      description: "Manage employees, attendance, payroll and HR operations.",
      accentColor: "#FF7900",
      iconBg: "#FFF2E2",
      arrowBg: "#FF7900",
      arrowShadow: "shadow-[0_4px_14px_rgba(255,121,0,0.35)]",
      hoverArrowShadow: "group-hover:shadow-[0_6px_18px_rgba(255,121,0,0.45)]",
      icon: <Users className="w-7 h-7 text-[#FF7900] stroke-[2.2]" />,
    },
  ];

  const handleCardClick = (id: string) => {
    navigate(`/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(id);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen flex flex-col justify-between relative font-['Poppins',sans-serif] selection:bg-[#FF7900] selection:text-white"
    >
      {/* 2 & 3. Header: Clean transparent / softly translucent header */}
      <header className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 pt-2.5 sm:pt-3.5 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shrink-0">
        {/* Left: iSQUARE Company Logo */}
        <div className="flex items-center">
          <ISquareLogo
            size="custom"
            customWidth={200}
            theme="dark"
            className="w-[185px] sm:w-[205px] h-auto object-contain cursor-pointer transition-opacity hover:opacity-95"
          />
        </div>

        {/* Right: Phone & Email Contact Info in a single horizontal row on desktop */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5 sm:gap-8 text-xs sm:text-[13.5px] font-semibold text-[#082B50]">
          <a
            href="tel:+919028516312"
            className="hover:text-[#FF7900] transition-colors flex items-center gap-2.5 group"
            title="Call iSquare Support"
          >
            <span className="w-6 h-6 rounded-full bg-[#FF7900] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Phone className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="tracking-tight">Call: +91 9028516312</span>
          </a>

          <a
            href="mailto:sales3@isquaresafety.com"
            className="hover:text-[#FF7900] transition-colors flex items-center gap-2.5 group"
            title="Email iSquare Support"
          >
            <span className="w-6 h-6 rounded-md bg-[#FF7900] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Mail className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="tracking-tight">Email: sales3@isquaresafety.com</span>
          </a>
        </div>
      </header>

      {/* 4. Main Content: Responsive Two-Column Layout */}
      <main className="flex-1 flex items-center w-full max-w-[1520px] mx-auto px-6 sm:px-12 py-4 sm:py-6 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center w-full">
          {/* Left Column: Heading and Description (~42% content width) */}
          {/* Positioned higher up and shifted rightward into the open space */}
          <div className="lg:col-span-5 flex flex-col items-start justify-start text-left -translate-y-10 sm:-translate-y-14 lg:-translate-y-32 xl:-translate-y-40 translate-x-3 sm:translate-x-6 lg:translate-x-10 xl:translate-x-14">
            {/* Short Orange Decorative Line Above Heading */}
            <div className="w-12 h-1 bg-[#FF7900] rounded-full mb-3 sm:mb-4" />

            {/* Heading: "Select" in navy blue, "Workspace" in safety orange */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight leading-[1.15] text-[#082B50]">
              Select <span className="text-[#FF7900]">Workspace</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#50667D] text-base sm:text-[17.5px] font-normal leading-[1.5] mt-3.5 sm:mt-4 max-w-[380px]">
              Choose the module you want to work on today
            </p>
          </div>

          {/* Right Column: Workspace Cards (~58% content width) */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center lg:items-end w-full">
            <div className="w-full max-w-[640px] flex flex-col gap-[18px]">
              {modules.map((m) => (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(m.id)}
                  onKeyDown={(e) => handleKeyDown(e, m.id)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.94)",
                  }}
                  className="group relative cursor-pointer rounded-[22px] border border-[#E0EAF5] shadow-[0_8px_24px_rgba(8,43,80,0.08)] hover:shadow-[0_12px_28px_rgba(8,43,80,0.12)] transition-all duration-200 hover:-translate-y-[2.5px] flex items-center justify-between p-5 sm:p-6 min-h-[125px] sm:h-[135px] lg:h-[138px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40"
                >
                  {/* 1. Colored Accent Line on the Left Edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[5px] rounded-l-[22px] transition-all duration-200 opacity-85 group-hover:opacity-100 group-hover:w-[6px]"
                    style={{ backgroundColor: m.accentColor }}
                  />

                  {/* 2 & 3. Icon + Title/Description Container */}
                  <div className="flex items-center gap-[22px] min-w-0 flex-1 pl-1">
                    {/* Icon in pastel rounded-square container (60-64px) */}
                    <div
                      className="w-[60px] h-[60px] sm:w-[62px] sm:h-[62px] rounded-[18px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: m.iconBg }}
                    >
                      {m.icon}
                    </div>

                    {/* Title and Short Description with 6-8px spacing */}
                    <div className="flex flex-col min-w-0 pr-2">
                      <h2 className="text-[#082B50] font-bold text-[18px] sm:text-[19px] leading-snug tracking-tight truncate sm:whitespace-normal">
                        {m.title}
                      </h2>
                      <p className="text-[#62758D] text-xs sm:text-[14px] leading-relaxed mt-[7px] font-normal line-clamp-2">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  {/* 4. Circular Arrow Button on Far Right (48-52px) */}
                  <div
                    className={`w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center text-white shrink-0 ml-3 sm:ml-4 ${m.arrowShadow} ${m.hoverArrowShadow} transition-all duration-200 group-hover:scale-105 group-hover:translate-x-0.5`}
                    style={{ backgroundColor: m.arrowBg }}
                    aria-label={`Enter ${m.title}`}
                  >
                    <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 7. Footer: Copyright */}
      <footer className="w-full py-4 text-center z-10 shrink-0">
        <div className="container mx-auto px-4">
          <p className="text-xs sm:text-[13.5px] font-medium text-[#082B50] tracking-wide">
            © 2026 <span className="font-bold">iSquare Safety Equipments Pvt. Ltd</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomeHub;
