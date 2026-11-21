import React, { useState } from "react";
import logoImg from "../../assets/isquare-logo.png";
import logoWhiteImg from "../../assets/isquare-logo-white.png";
import iconImg from "../../assets/isquare-icon-square.png";

interface ISquareLogoProps {
  className?: string;
  imgClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "custom";
  showText?: boolean;
  theme?: "light" | "dark" | "blue" | "white";
  iconOnly?: boolean;
  customWidth?: number;
  customHeight?: number;
}

export const ISquareIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 38,
}) => {
  const [errorIdx, setErrorIdx] = useState(0);
  const baseUrl = import.meta.env.BASE_URL || "/";

  const iconSources = [
    iconImg,
    `${baseUrl}isquare-icon-square.png`,
    `${baseUrl}assets/isquare-icon-square.png`,
    `${baseUrl}favicon.png`,
  ];

  const currentSrc = iconSources[errorIdx] || iconImg;

  return (
    <img
      src={currentSrc}
      alt="iSquare Shield Icon"
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      onError={() => {
        if (errorIdx < iconSources.length - 1) {
          setErrorIdx((prev) => prev + 1);
        }
      }}
      className={`shrink-0 object-contain block ${className}`}
    />
  );
};

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
  const [errorIdx, setErrorIdx] = useState(0);

  const pixelHeightMap: Record<string, number> = {
    sm: 32,
    md: 44,
    lg: 64,
    xl: 80,
    "2xl": 96,
    "3xl": 112,
    custom: customHeight || 44,
  };

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

  const isWhite = theme === "light" || theme === "white";
  const primaryImg = isWhite ? logoWhiteImg : logoImg;
  const secondaryImg = isWhite ? logoImg : logoWhiteImg;
  const baseUrl = import.meta.env.BASE_URL || "/";

  const candidateSources = [
    primaryImg,
    isWhite ? `${baseUrl}isquare-logo-white.png` : `${baseUrl}isquare-logo.png`,
    isWhite ? `${baseUrl}assets/isquare-logo-white.png` : `${baseUrl}assets/isquare-logo.png`,
    secondaryImg,
    isWhite ? `${baseUrl}isquare-logo.png` : `${baseUrl}isquare-logo-white.png`,
    `${baseUrl}favicon.png`,
  ];

  const currentSrc = candidateSources[errorIdx] || primaryImg;
  const targetHeight = customHeight || pixelHeightMap[size] || 44;

  const customStyle: React.CSSProperties = {
    height: `${targetHeight}px`,
    width: customWidth ? `${customWidth}px` : "auto",
    maxHeight: `${targetHeight}px`,
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={currentSrc}
        alt="iSquare Safety Equipments Pvt. Ltd"
        style={customStyle}
        onError={() => {
          if (errorIdx < candidateSources.length - 1) {
            setErrorIdx((prev) => prev + 1);
          }
        }}
        className={`object-contain max-w-full block ${
          size !== "custom" ? heightMap[size] || "h-11" : ""
        } ${imgClassName}`}
      />
    </div>
  );
};

export default ISquareLogo;
