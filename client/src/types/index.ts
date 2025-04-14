import { 
  User, 
  ClothingItem, 
  Outfit, 
  ShoppingItem, 
  WeatherInfo,
  ClothingCategory,
  Season,
  Color 
} from "@shared/schema";

export type TabType = "weather" | "occasions" | "saved";

export interface AIOutfitResponse {
  success: boolean;
  outfit?: {
    name: string;
    description: string;
    items: {
      category: ClothingCategory;
      description: string;
      color: Color;
      image?: string; // URL للصورة أو Base64 للصورة
    }[];
    outfitImage?: string; // صورة كاملة للإطلالة
    imagePrompt?: string;
  };
  error?: string;
}

export type WeatherForecast = {
  today: WeatherInfo;
  tomorrow: WeatherInfo;
  afterTomorrow: WeatherInfo;
};

export interface WardrobeFilters {
  category?: ClothingCategory | "all";
  colors?: Color[];
  seasons?: Season[];
  searchTerm?: string;
}

export type ActiveTab = "weather" | "occasions" | "saved";
