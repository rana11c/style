import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import FloatingActionButton from "../components/FloatingActionButton";
import TabNavigation from "../components/TabNavigation";
import WeatherForecast from "../components/WeatherForecast";
import OutfitRecommendation from "../components/OutfitRecommendation";
import AddClothingForm from "../components/AddClothingForm";
import { ActiveTab, AIOutfitResponse, WeatherForecast as WeatherForecastType } from "../types";
import { fetchWeatherData } from "../lib/weather";
import { generateOutfitForWeather } from "../lib/openai";
import { useToast } from "@/hooks/use-toast";

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("weather");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<AIOutfitResponse | null>(null);
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current date in Arabic format
  const currentDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Query weather data
  const { data: weather, isLoading: isLoadingWeather, error: weatherError } = useQuery({
    queryKey: ['/api/weather'],
    queryFn: async () => {
      if (navigator.geolocation) {
        return new Promise<WeatherForecastType>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetchWeatherData(position.coords.latitude, position.coords.longitude)
                .then(resolve)
                .catch(() => resolve(fetchWeatherData()));
            },
            () => {
              // If user denies location or any error occurs, use default weather
              fetchWeatherData().then(resolve);
            }
          );
        });
      } else {
        return fetchWeatherData();
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleAddClothingSuccess = () => {
    setShowAddForm(false);
    toast({
      title: "تمت الإضافة بنجاح",
      description: "تمت إضافة قطعة الملابس إلى خزانتك",
    });
  };

  const handleFloatingButtonClick = () => {
    setShowAddForm(!showAddForm);
  };

  const generateOutfit = async (weatherType: "today" | "tomorrow" | "afterTomorrow") => {
    if (!weather) return;
    
    try {
      setIsLoadingOutfit(true);
      setOutfitError(null);

      const weatherData = weather[weatherType];
      const outfit = await generateOutfitForWeather(
        weatherData.condition,
        weatherData.temp,
        weatherType === "today" ? "اليوم" : weatherType === "tomorrow" ? "غداً" : "بعد غد"
      );

      setCurrentOutfit(outfit);
    } catch (error) {
      setOutfitError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الإطلالة");
    } finally {
      setIsLoadingOutfit(false);
    }
  };

  // If weather is loaded, attempt to generate outfit recommendation for today
  useEffect(() => {
    if (weather && !currentOutfit && !isLoadingOutfit) {
      generateOutfit("today");
    }
  }, [weather]);

  // Handle weather loading error
  useEffect(() => {
    if (weatherError) {
      toast({
        title: "خطأ في تحميل بيانات الطقس",
        description: "تعذر الحصول على بيانات الطقس، يرجى المحاولة مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  }, [weatherError, toast]);

  if (isLoadingWeather) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

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
            <OutfitRecommendation 
              outfit={currentOutfit}
              loading={isLoadingOutfit}
              error={outfitError}
              onRetry={() => generateOutfit("today")}
            />
            
            <WeatherForecast 
              forecast={weather || {
                today: { temp: 27, condition: "مشمس", icon: "☀️" },
                tomorrow: { temp: 23, condition: "غائم جزئياً", icon: "⛅" },
                afterTomorrow: { temp: 21, condition: "غائم", icon: "☁️" },
              }}
              onRequestOutfit={generateOutfit}
            />
          </>
        )}

        {activeTab === "occasions" && (
          <div className="px-4">
            <h2 className="text-lg font-bold mb-4">اقتراحات للمناسبات</h2>
            <p className="text-gray-600 mb-4">اختر من المناسبات الشائعة للحصول على اقتراحات الأزياء المناسبة</p>
            
            <div className="grid grid-cols-2 gap-3">
              {["حفل رسمي", "مقابلة عمل", "تسوق", "رياضة", "سهرة", "يوم عمل"].map((occasion) => (
                <button key={occasion} className="bg-white border border-gray-200 hover:border-primary rounded-lg p-4 text-center transition-colors">
                  {occasion}
                </button>
              ))}
            </div>
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

        {showAddForm && (
          <AddClothingForm onSuccess={handleAddClothingSuccess} />
        )}
      </div>
      
      <FloatingActionButton onClick={handleFloatingButtonClick} />
      <BottomNavigation />
    </div>
  );
};

export default Home;
