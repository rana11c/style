import { AIOutfitResponse } from "../../client/src/types";
import { ClothingItem, ClothingCategory, Color } from "@shared/schema";

// Helper function to get clothing based on temperature range
const getWeatherBasedClothing = (
  temperature: number,
  weatherCondition: string
): { 
  categories: ClothingCategory[]; 
  colors: Color[];
  descriptions: string[];
} => {
  let categories: ClothingCategory[] = [];
  let colors: Color[] = [];
  let descriptions: string[] = [];
  
  // Temperature based logic
  if (temperature < 10) {
    // Cold weather
    categories = ["jackets", "jackets", "pants", "shoes"]; // Using available categories
    colors = ["black", "gray", "blue"]; // Using available colors
    descriptions = [
      "معطف شتوي دافئ",
      "سترة صوفية",
      "بنطلون قماش سميك",
      "حذاء شتوي مريح"
    ];
  } else if (temperature < 20) {
    // Cool weather
    categories = ["jackets", "shirts", "pants", "shoes"];
    colors = ["blue", "green", "brown"];
    descriptions = [
      "جاكيت خفيف",
      "قميص بأكمام طويلة",
      "بنطلون جينز",
      "حذاء رياضي"
    ];
  } else if (temperature < 30) {
    // Warm weather
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "blue", "blue"];
    descriptions = [
      "تيشيرت قطني",
      "بنطلون خفيف",
      "حذاء رياضي مريح"
    ];
  } else {
    // Hot weather
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "blue", "brown"];
    descriptions = [
      "تيشيرت قطني خفيف",
      "شورت قصير",
      "صندل مريح"
    ];
  }

  // Weather condition adjustments
  if (weatherCondition.includes("rain") || weatherCondition.includes("مطر")) {
    categories = categories.map(c => c === "shoes" ? "shoes" : c);
    descriptions = descriptions.map(d => {
      if (d.includes("حذاء")) {
        return "حذاء مقاوم للماء";
      }
      return d;
    });
  }

  return { categories, colors, descriptions };
};

export async function generateOutfitRecommendation(
  weatherCondition: string,
  temperature: number,
  date: string,
  userClothingItems?: ClothingItem[]
): Promise<AIOutfitResponse> {
  try {
    const { categories, colors, descriptions } = getWeatherBasedClothing(temperature, weatherCondition);
    
    // Create a basic outfit based on weather
    const outfit = {
      name: `إطلالة مناسبة لـ ${temperature}°C و${weatherCondition}`,
      description: `إطلالة مريحة ومناسبة للطقس ${weatherCondition} ودرجة حرارة ${temperature}°C. تم اختيار قطع تناسب هذه الظروف الجوية لتوفير الراحة والأناقة.`,
      items: categories.map((category, index) => ({
        category,
        description: descriptions[index] || `قطعة من فئة ${category}`,
        color: colors[index % colors.length]
      }))
    };
    
    return {
      success: true,
      outfit
    };
  } catch (error) {
    console.error("Error generating outfit recommendation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل في إنشاء توصية الإطلالة"
    };
  }
}

// Helper function to get outfit suggestions based on occasion
const getOccasionBasedOutfit = (
  occasion: string,
  preferences: string[] = []
): { 
  name: string;
  description: string;
  items: { category: ClothingCategory; description: string; color: Color }[];
} => {
  // Default outfits based on common occasions
  const occasionOutfits: Record<string, {
    name: string;
    description: string;
    items: { category: ClothingCategory; description: string; color: Color }[];
  }> = {
    "عمل": {
      name: "إطلالة رسمية للعمل",
      description: "مظهر مهني وأنيق مناسب لبيئة العمل",
      items: [
        { category: "shirts", description: "قميص أنيق", color: "white" },
        { category: "pants", description: "بنطلون كلاسيكي", color: "blue" },
        { category: "shoes", description: "حذاء رسمي", color: "black" }
      ]
    },
    "حفلة": {
      name: "إطلالة حفلة مسائية",
      description: "مظهر أنيق وعصري مناسب للحفلات والمناسبات المسائية",
      items: [
        { category: "shirts", description: "قميص أنيق", color: "black" },
        { category: "pants", description: "بنطلون أنيق", color: "black" },
        { category: "shoes", description: "حذاء أنيق", color: "black" }
      ]
    },
    "تسوق": {
      name: "إطلالة عصرية للتسوق",
      description: "مظهر مريح وعملي للتسوق اليومي",
      items: [
        { category: "shirts", description: "تيشيرت مريح", color: "gray" },
        { category: "pants", description: "جينز", color: "blue" },
        { category: "shoes", description: "حذاء رياضي", color: "white" }
      ]
    },
    "رياضة": {
      name: "إطلالة رياضية",
      description: "مظهر رياضي مريح ومناسب للأنشطة البدنية",
      items: [
        { category: "shirts", description: "تيشيرت رياضي", color: "black" },
        { category: "pants", description: "بنطلون رياضي", color: "blue" },
        { category: "shoes", description: "حذاء رياضي", color: "white" }
      ]
    },
    "تنزه": {
      name: "إطلالة للتنزه",
      description: "مظهر مريح ومناسب للتنزه والخروجات اليومية",
      items: [
        { category: "shirts", description: "تيشيرت كاجوال", color: "blue" },
        { category: "pants", description: "بنطلون خفيف", color: "brown" },
        { category: "shoes", description: "حذاء مريح", color: "brown" }
      ]
    }
  };

  // Check for specific occasions or use default casual outfit
  const lowercaseOccasion = occasion.toLowerCase();
  
  // Try to match the occasion with our predefined outfits
  for (const [key, outfit] of Object.entries(occasionOutfits)) {
    if (lowercaseOccasion.includes(key.toLowerCase())) {
      return outfit;
    }
  }

  // Default outfit for unrecognized occasions
  return {
    name: `إطلالة مناسبة لـ ${occasion}`,
    description: `مظهر أنيق ومناسب لمناسبة ${occasion}`,
    items: [
      { category: "shirts", description: "قميص أنيق", color: "white" },
      { category: "pants", description: "بنطلون أنيق", color: "blue" },
      { category: "shoes", description: "حذاء مريح", color: "black" }
    ]
  };
};

export async function generateOutfitForSpecificOccasion(
  occasion: string,
  preferences: string[] = [],
  userClothingItems?: ClothingItem[]
): Promise<AIOutfitResponse> {
  try {
    const outfit = getOccasionBasedOutfit(occasion, preferences);
    
    return {
      success: true,
      outfit
    };
  } catch (error) {
    console.error("Error generating outfit for occasion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل في إنشاء توصية للمناسبة"
    };
  }
}

// Helper function to filter and create outfits from wardrobe items
const createOutfitFromWardrobe = (
  clothingItems: ClothingItem[],
  occasion?: string,
  weather?: { condition: string; temperature: number }
): {
  name: string;
  description: string;
  items: { category: ClothingCategory; description: string; color: Color }[];
} => {
  // Filter items by weather/season if available
  let filteredItems = [...clothingItems];
  let seasonFilter: "summer" | "winter" | "fall" | "spring" = "summer";
  
  if (weather) {
    // Determine season from temperature
    if (weather.temperature < 10) {
      seasonFilter = "winter";
    } else if (weather.temperature < 20) {
      seasonFilter = "fall";
    } else if (weather.temperature < 30) {
      seasonFilter = "spring";
    } else {
      seasonFilter = "summer";
    }
    
    // Filter for items suitable for this season
    filteredItems = filteredItems.filter(item => 
      item.seasons.includes(seasonFilter) || item.seasons.includes("spring")
    );
  }
  
  // Group by categories
  const itemsByCategory: Record<string, ClothingItem[]> = {};
  filteredItems.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });
  
  // Build an outfit with one item per major category if possible
  const essentialCategories: ClothingCategory[] = ["shirts", "pants", "shoes"];
  const outfitItems: ClothingItem[] = [];
  
  essentialCategories.forEach(category => {
    if (itemsByCategory[category] && itemsByCategory[category].length > 0) {
      // Pick an item from this category (random selection)
      const randomIndex = Math.floor(Math.random() * itemsByCategory[category].length);
      outfitItems.push(itemsByCategory[category][randomIndex]);
    }
  });
  
  // Add accessories if available
  if (itemsByCategory["accessories"] && itemsByCategory["accessories"].length > 0) {
    outfitItems.push(itemsByCategory["accessories"][0]);
  }
  
  // Create outfit name and description
  let outfitName = "إطلالة من خزانة ملابسك";
  let outfitDescription = "مجموعة متناسقة من الملابس من خزانتك";
  
  if (occasion) {
    outfitName = `إطلالة لـ ${occasion} من خزانة ملابسك`;
    outfitDescription = `مجموعة ملابس مناسبة لـ ${occasion} تم اختيارها من خزانتك الخاصة`;
  }
  
  if (weather) {
    outfitName += ` مناسبة لـ ${weather.temperature}°C`;
    outfitDescription += ` مناسبة لطقس ${weather.condition} ودرجة حرارة ${weather.temperature}°C`;
  }
  
  return {
    name: outfitName,
    description: outfitDescription,
    items: outfitItems.map(item => ({
      category: item.category as ClothingCategory,
      description: item.name,
      color: item.colors[0] as Color
    }))
  };
};

export async function generateOutfitFromWardrobeItems(
  clothingItems: ClothingItem[],
  occasion?: string,
  weather?: { condition: string; temperature: number }
): Promise<AIOutfitResponse> {
  try {
    if (!clothingItems || clothingItems.length === 0) {
      throw new Error("لا توجد ملابس في خزانتك");
    }

    // Generate a suitable outfit from the user's wardrobe
    const outfit = createOutfitFromWardrobe(clothingItems, occasion, weather);
    
    return {
      success: true,
      outfit
    };
  } catch (error) {
    console.error("Error generating outfit from wardrobe items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل في إنشاء إطلالة من خزانة ملابسك"
    };
  }
}
