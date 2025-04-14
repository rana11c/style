import React from "react";
import { BellIcon, InfoIcon } from "lucide-react";
import Logo from "./Logo";
import { WeatherInfo } from "@shared/schema";

interface HeaderProps {
  weather: WeatherInfo;
  date: string;
}

const Header: React.FC<HeaderProps> = ({ weather, date }) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="p-2 bg-primary text-white rounded-full">
            <InfoIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-white flex justify-between items-center text-sm border-b">
        <div className="flex items-center">
          {weather.condition === "مشمس" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 001.7-9.7 7 7 0 10-13.4 4.7" />
            </svg>
          )}
          <span>{`${weather.temp}°, ${weather.condition}`}</span>
        </div>
        <div>
          <span>{date}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
