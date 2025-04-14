import React from "react";
import { Link, useLocation } from "wouter";
import { 
  ShirtIcon, 
  SlidersHorizontalIcon, 
  ShoppingBagIcon, 
  UserIcon 
} from "lucide-react";

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20">
      <div className="max-w-md mx-auto flex justify-around">
        <Link href="/wardrobe">
          <a className="flex flex-col items-center py-2 px-4">
            <ShirtIcon className={`h-6 w-6 ${isActive("/wardrobe") ? "text-primary" : "text-gray-500"}`} />
            <span className={`text-xs ${isActive("/wardrobe") ? "text-primary" : ""}`}>ملابسي</span>
          </a>
        </Link>
        
        <Link href="/suggestions">
          <a className="flex flex-col items-center py-2 px-4">
            <SlidersHorizontalIcon className={`h-6 w-6 ${isActive("/suggestions") ? "text-primary" : "text-gray-500"}`} />
            <span className={`text-xs ${isActive("/suggestions") ? "text-primary" : ""}`}>اقتراحات</span>
          </a>
        </Link>
        
        <div className="flex-1"></div>
        
        <Link href="/shopping">
          <a className="flex flex-col items-center py-2 px-4">
            <ShoppingBagIcon className={`h-6 w-6 ${isActive("/shopping") ? "text-primary" : "text-gray-500"}`} />
            <span className={`text-xs ${isActive("/shopping") ? "text-primary" : ""}`}>تسوق</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className="flex flex-col items-center py-2 px-4">
            <UserIcon className={`h-6 w-6 ${isActive("/profile") ? "text-primary" : "text-gray-500"}`} />
            <span className={`text-xs ${isActive("/profile") ? "text-primary" : ""}`}>حسابي</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
