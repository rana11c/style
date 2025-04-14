import { Request, Response } from "express";
import { WeatherForecast } from "../../client/src/types";

export const getWeatherForecast = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    
    // If latitude and longitude are provided, fetch real weather data
    if (lat && lon) {
      try {
        const weatherData = await fetchRealWeatherData(
          parseFloat(lat as string), 
          parseFloat(lon as string)
        );
        return res.status(200).json(weatherData);
      } catch (error) {
        console.error("Error fetching real weather data:", error);
        // Fall back to default weather if API call fails
      }
    }
    
    // Return default weather data
    const defaultWeather: WeatherForecast = {
      today: { temp: 27, condition: "مشمس", icon: "☀️" },
      tomorrow: { temp: 23, condition: "غائم جزئياً", icon: "⛅" },
      afterTomorrow: { temp: 21, condition: "غائم", icon: "☁️" },
    };
    
    res.status(200).json(defaultWeather);
  } catch (error) {
    console.error("Error in weather forecast:", error);
    res.status(500).json({ message: "Failed to get weather forecast" });
  }
};

// Function to fetch real weather data from a weather API
// Note: In a real app, you would use a proper weather API like OpenWeatherMap or WeatherAPI
async function fetchRealWeatherData(lat: number, lon: number): Promise<WeatherForecast> {
  // Check if we have an API key for weather service
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("Weather API key not configured");
  }
  
  try {
    // This is a placeholder for a real API call
    // In a production app, you would make a fetch to a real weather API
    // Example with OpenWeatherMap:
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`);
    // const data = await response.json();
    
    // For now, we'll simulate a response based on the coordinates
    // This would be replaced with actual API logic in production
    
    // Generate slightly different temperatures based on latitude
    const baseTemp = 25 + (lat > 0 ? 2 : -2);
    const todayTemp = Math.round(baseTemp + Math.random() * 5);
    const tomorrowTemp = Math.round(baseTemp - 2 + Math.random() * 4);
    const afterTomorrowTemp = Math.round(baseTemp - 4 + Math.random() * 3);
    
    // Weather conditions based on longitude (just for simulation)
    let todayCondition, tomorrowCondition, afterTomorrowCondition;
    
    if (lon > 0) {
      todayCondition = "مشمس";
      tomorrowCondition = "غائم جزئياً";
      afterTomorrowCondition = "غائم";
    } else {
      todayCondition = "غائم جزئياً";
      tomorrowCondition = "غائم";
      afterTomorrowCondition = "مشمس";
    }
    
    // Icons
    const todayIcon = todayCondition === "مشمس" ? "☀️" : todayCondition === "غائم جزئياً" ? "⛅" : "☁️";
    const tomorrowIcon = tomorrowCondition === "مشمس" ? "☀️" : tomorrowCondition === "غائم جزئياً" ? "⛅" : "☁️";
    const afterTomorrowIcon = afterTomorrowCondition === "مشمس" ? "☀️" : afterTomorrowCondition === "غائم جزئياً" ? "⛅" : "☁️";
    
    return {
      today: { temp: todayTemp, condition: todayCondition, icon: todayIcon },
      tomorrow: { temp: tomorrowTemp, condition: tomorrowCondition, icon: tomorrowIcon },
      afterTomorrow: { temp: afterTomorrowTemp, condition: afterTomorrowCondition, icon: afterTomorrowIcon },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data");
  }
}
