import React from "react";
import { WeatherForecast as WeatherForecastType } from "../types";
import { SunIcon, CloudIcon, CloudSunIcon } from "lucide-react";

interface WeatherForecastProps {
  forecast: WeatherForecastType;
  onRequestOutfit: (weather: "today" | "tomorrow" | "afterTomorrow") => void;
}

const WeatherForecastComponent: React.FC<WeatherForecastProps> = ({ forecast, onRequestOutfit }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "مشمس":
        return <SunIcon className="h-6 w-6" />;
      case "غائم":
        return <CloudIcon className="h-6 w-6" />;
      case "غائم جزئياً":
        return <CloudSunIcon className="h-6 w-6" />;
      default:
        return <SunIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-bold mb-2">اقتراحات حسب الطقس</h2>
      <p className="text-sm text-gray-600 mb-4">
        اختر إطلالة مناسبة لحالة الطقس اليوم وخلال الأيام القادمة.
      </p>
      
      {/* Today's weather suggestion */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-lg font-semibold">اليوم: </span>
          <span className="mr-1 font-bold">{forecast.today.temp}°</span>
          <span className="mr-1">{forecast.today.condition}</span>
          {getWeatherIcon(forecast.today.condition)}
        </div>
        
        <button 
          className="w-full styler-btn-primary flex justify-center items-center"
          onClick={() => onRequestOutfit("today")}
        >
          <span>اقترح إطلالة مناسبة لهذا الطقس</span>
        </button>
      </div>
      
      {/* Tomorrow's weather suggestion */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-lg font-semibold">غداً: </span>
          <span className="mr-1 font-bold">{forecast.tomorrow.temp}°</span>
          <span className="mr-1">{forecast.tomorrow.condition}</span>
          {getWeatherIcon(forecast.tomorrow.condition)}
        </div>
        
        <button 
          className="w-full styler-btn-primary flex justify-center items-center" 
          onClick={() => onRequestOutfit("tomorrow")}
        >
          <span>اقترح إطلالة مناسبة لهذا الطقس</span>
        </button>
      </div>
      
      {/* Day after tomorrow's weather suggestion */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-lg font-semibold">بعد غد: </span>
          <span className="mr-1 font-bold">{forecast.afterTomorrow.temp}°</span>
          <span className="mr-1">{forecast.afterTomorrow.condition}</span>
          {getWeatherIcon(forecast.afterTomorrow.condition)}
        </div>
        
        <button 
          className="w-full styler-btn-primary flex justify-center items-center"
          onClick={() => onRequestOutfit("afterTomorrow")}
        >
          <span>اقترح إطلالة مناسبة لهذا الطقس</span>
        </button>
      </div>
    </div>
  );
};

export default WeatherForecastComponent;
