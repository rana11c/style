import { WeatherForecast } from "../types";

// Mock data for initial development
// In a real app, this would come from a weather API
export const getDefaultWeather = (): WeatherForecast => {
  return {
    today: { temp: 27, condition: "مشمس", icon: "☀️" },
    tomorrow: { temp: 23, condition: "غائم جزئياً", icon: "⛅" },
    afterTomorrow: { temp: 21, condition: "غائم", icon: "☁️" },
  };
};

export const fetchWeatherData = async (latitude?: number, longitude?: number): Promise<WeatherForecast> => {
  try {
    // If location is provided, fetch from API
    if (latitude && longitude) {
      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      
      if (response.ok) {
        return await response.json();
      }
    }
    
    // Fallback to default weather
    return getDefaultWeather();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return getDefaultWeather();
  }
};

export const getWeatherIcon = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('مشمس') || conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return '☀️';
  } else if (conditionLower.includes('غائم جزئياً') || conditionLower.includes('partly cloudy')) {
    return '⛅';
  } else if (conditionLower.includes('غائم') || conditionLower.includes('cloudy')) {
    return '☁️';
  } else if (conditionLower.includes('ممطر') || conditionLower.includes('rain')) {
    return '🌧️';
  } else if (conditionLower.includes('ثلج') || conditionLower.includes('snow')) {
    return '❄️';
  } else if (conditionLower.includes('عاصف') || conditionLower.includes('storm')) {
    return '⛈️';
  } else {
    return '🌤️';
  }
};

export const getWeatherSuggestion = (temp: number, condition: string): string => {
  if (temp > 30) {
    return 'ملابس خفيفة جداً وقطنية، احمل معك ماء وتجنب الخروج في ساعات الذروة';
  } else if (temp > 25) {
    return 'ملابس خفيفة وقطنية مناسبة للطقس الحار';
  } else if (temp > 20) {
    return 'ملابس متوسطة، يمكن ارتداء قميص مع سترة خفيفة';
  } else if (temp > 15) {
    return 'ملابس متوسطة إلى ثقيلة، قد تحتاج لطبقات إضافية في المساء';
  } else if (temp > 10) {
    return 'ملابس ثقيلة وطبقات متعددة، لا تنسى الجاكيت';
  } else {
    return 'ملابس شتوية ثقيلة، معطف وقفازات وقبعة';
  }
};
