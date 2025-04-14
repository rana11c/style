import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { 
  UserIcon, 
  SettingsIcon, 
  LogOutIcon, 
  HeartIcon, 
  HistoryIcon, 
  HelpCircleIcon 
} from "lucide-react";
import { getDefaultWeather } from "../lib/weather";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Get current date in Arabic format
  const currentDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Default weather data (would be fetched from API in real app)
  const defaultWeather = getDefaultWeather().today;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  // Stats data
  const stats = [
    { label: "قطع الملابس", value: 12 },
    { label: "إطلالات محفوظة", value: 5 },
    { label: "توصيات", value: 8 },
  ];

  // Profile menu items
  const menuItems = [
    { icon: <HeartIcon className="w-5 h-5 mr-2" />, label: "الإطلالات المفضلة", action: () => {} },
    { icon: <HistoryIcon className="w-5 h-5 mr-2" />, label: "سجل الإطلالات", action: () => {} },
    { icon: <SettingsIcon className="w-5 h-5 mr-2" />, label: "الإعدادات", action: () => {} },
    { icon: <HelpCircleIcon className="w-5 h-5 mr-2" />, label: "المساعدة", action: () => {} },
    { icon: <LogOutIcon className="w-5 h-5 mr-2" />, label: "تسجيل الخروج", action: handleLogout, className: "text-red-500" },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header 
        weather={defaultWeather}
        date={currentDate}
      />
      
      <div className="pt-4 pb-16">
        <div className="px-4">
          <div className="bg-primary/10 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.name || "المستخدم"}</h2>
                <p className="text-gray-600">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-0">
              <ul className="divide-y">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <button 
                      className={`w-full flex items-center p-4 text-right hover:bg-gray-50 ${item.className || ""}`}
                      onClick={item.action}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="text-center text-gray-500 text-sm">
            <p>نسخة التطبيق: 1.0.0</p>
            <p>© 2025 ستايلر. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
