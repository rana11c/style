import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <h1 className={`text-xl font-bold ${className}`}>
      <span className="text-accent">Styler</span>
      <span className="text-primary">ستايلر</span>
    </h1>
  );
};

export default Logo;
