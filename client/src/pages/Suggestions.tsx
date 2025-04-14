import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import FloatingActionButton from "../components/FloatingActionButton";
import TabNavigation from "../components/TabNavigation";
import WeatherForecast from "../components/WeatherForecast";
import OutfitRecommendation from "../components/OutfitRecommendation";
import { ActiveTab, AIOutfitResponse } from "../types";
import { getDefaultWeather } from "../lib/weather";
import { generateOutfitForWeather, generateOutfitForOccasion } from "../lib/openai";
import { useToast } from "@/hooks/use-toast";

const Suggestions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("weather");
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get current date in Arabic format
  const currentDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Query weather data
  const { data: weather } = useQuery({
    queryKey: ['/api/weather'],
    queryFn: () => getDefaultWeather(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Mutation for generating outfits
  const weatherOutfitMutation = useMutation({
    mutationFn: async (params: { weatherType: "today" | "tomorrow" | "afterTomorrow" }) => {
      if (!weather) throw new Error("Weather data not available");
      
      const weatherData = weather[params.weatherType];
      return generateOutfitForWeather(
        weatherData.condition,
        weatherData.temp,
        params.weatherType === "today" ? "اليوم" : params.weatherType === "tomorrow" ? "غداً" : "بعد غد"
      );
    },
    onError: (error) => {
      toast({
        title: "خطأ في توليد الإطلالة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const occasionOutfitMutation = useMutation({
    mutationFn: async (occasion: string) => {
      return generateOutfitForOccasion(occasion);
    },
    onError: (error) => {
      toast({
        title: "خطأ في توليد الإطلالة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleWeatherOutfitRequest = (weatherType: "today" | "tomorrow" | "afterTomorrow") => {
    weatherOutfitMutation.mutate({ weatherType });
  };

  const handleOccasionSelect = (occasion: string) => {
    setSelectedOccasion(occasion);
    occasionOutfitMutation.mutate(occasion);
  };

  // Common occasions
  const occasions = [
    { id: "formal", label: "حفل رسمي" },
    { id: "interview", label: "مقابلة عمل" },
    { id: "shopping", label: "تسوق" },
    { id: "sport", label: "رياضة" },
    { id: "party", label: "سهرة" },
    { id: "work", label: "يوم عمل" },
    { id: "casual", label: "يوم عادي" },
    { id: "wedding", label: "حفل زفاف" },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header 
        weather={weather?.today || { temp: 27, condition: "مشمس", icon: "☀️" }}
        date={currentDate}
      />
      
      <div className="pt-2 pb-16">
        <TabNavigation 
          activeTab={activeTab} 
          onChangeTab={handleTabChange} 
        />

        {activeTab === "weather" && (
          <>
            {weatherOutfitMutation.isPending && (
              <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-4">إطلالة حسب الطقس</h3>
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">جاري تحميل الإطلالة...</p>
                </div>
              </div>
            )}
            
            {weatherOutfitMutation.isSuccess && (
              <OutfitRecommendation 
                outfit={weatherOutfitMutation.data as AIOutfitResponse}
                loading={false}
                error={null}
                onRetry={() => weatherOutfitMutation.mutate({ weatherType: "today" })}
              />
            )}
            
            <WeatherForecast 
              forecast={weather || {
                today: { temp: 27, condition: "مشمس", icon: "☀️" },
                tomorrow: { temp: 23, condition: "غائم جزئياً", icon: "⛅" },
                afterTomorrow: { temp: 21, condition: "غائم", icon: "☁️" },
              }}
              onRequestOutfit={handleWeatherOutfitRequest}
            />
          </>
        )}

        {activeTab === "occasions" && (
          <div className="px-4">
            <h2 className="text-lg font-bold mb-4">اقتراحات للمناسبات</h2>
            <p className="text-gray-600 mb-4">اختر من المناسبات الشائعة للحصول على اقتراحات الأزياء المناسبة</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {occasions.map((occasion) => (
                <button 
                  key={occasion.id} 
                  className={`${
                    selectedOccasion === occasion.id
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 hover:border-primary"
                  } rounded-lg p-4 text-center transition-colors`}
                  onClick={() => handleOccasionSelect(occasion.label)}
                >
                  {occasion.label}
                </button>
              ))}
            </div>
            
            {occasionOutfitMutation.isPending && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">جاري تحميل الإطلالة المناسبة...</p>
                </div>
              </div>
            )}
            
            {occasionOutfitMutation.isSuccess && (
              <OutfitRecommendation 
                outfit={occasionOutfitMutation.data as AIOutfitResponse}
                loading={false}
                error={null}
                onRetry={() => selectedOccasion && handleOccasionSelect(selectedOccasion)}
              />
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="px-4">
            <h2 className="text-lg font-bold mb-4">الإطلالات المحفوظة</h2>
            <div className="bg-neutral bg-opacity-30 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-2">لم تقم بحفظ أي إطلالات بعد</p>
              <p className="text-sm text-gray-500">يمكنك حفظ الإطلالات المقترحة بالضغط على زر الحفظ</p>
            </div>
          </div>
        )}
      </div>
      
      <FloatingActionButton onClick={() => {}} />
      <BottomNavigation />
    </div>
  );
};

export default Suggestions;
