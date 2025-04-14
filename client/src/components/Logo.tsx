import React from "react";
import logoSrc from "../assets/logo.svg";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoSrc} alt="Styler Logo" className="h-10 w-10" />
      <h1 className="text-xl font-bold">
        <span className="text-primary ml-1">ستايلر</span>
        <span className="text-accent text-sm block">Styler</span>
      </h1>
    </div>
  );
};

export default Logo;
