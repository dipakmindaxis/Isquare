import React from "react";
import logoImg from "../../assets/isquare-logo.png";
import logoWhiteImg from "../../assets/isquare-logo-white.png";
import iconImg from "../../assets/isquare-icon-square.png";

interface ISquareLogoProps {
  className?: string;
  imgClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  showText?: boolean;
  theme?: "light" | "dark" | "blue" | "white";
  iconOnly?: boolean;
  customWidth?: number;
  customHeight?: number;
}

export const ISquareIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 38,
}) => (
  <img
    src={iconImg}
    alt="iSquare Shield Icon"
    width={size}
    height={size}
    style={{ width: `${size}px`, height: `${size}px` }}
    className={`shrink-0 object-contain ${className}`}
  />
);

export const ISquareLogo: React.FC<ISquareLogoProps> = ({
  className = "",
  imgClassName = "",
  size = "md",
  showText = true,
  theme = "dark",
  iconOnly = false,
  customWidth,
  customHeight,
}) => {
  const heightMap: Record<string, string> = {
    sm: "h-8",
    md: "h-11",
    lg: "h-16",
    xl: "h-20",
    "2xl": "h-24",
    "3xl": "h-28",
    custom: "",
  };

  const iconSizes: Record<string, number> = {
    sm: 32,
    md: 44,
    lg: 64,
    xl: 80,
    "2xl": 96,
    "3xl": 112,
    custom: customWidth || customHeight || 40,
  };

  if (iconOnly || !showText) {
    return <ISquareIcon size={iconSizes[size]} className={className} />;
  }

  const selectedSrc =
    theme === "light" || theme === "white" ? logoWhiteImg : logoImg;
  const customStyle: React.CSSProperties = {};
  if (customHeight) customStyle.height = `${customHeight}px`;
  if (customWidth) customStyle.width = `${customWidth}px`;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={selectedSrc}
        alt="iSquare Safety Equipments Pvt. Ltd"
        style={customStyle}
        className={`object-contain max-w-full ${
          size !== "custom" ? heightMap[size] || "h-10" : ""
        } ${imgClassName}`}
      />
    </div>
  );
};

export default ISquareLogo;
