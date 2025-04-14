import { AIOutfitResponse } from "../../client/src/types";
import { ClothingItem, ClothingCategory, Color } from "@shared/schema";
import { getClothingItemImage, generateOutfitImage, svgToDataUrl } from "./imageGenerator";

// Helper function to get clothing based on temperature range
const getWeatherBasedClothing = (
  temperature: number,
  weatherCondition: string
): { 
  categories: ClothingCategory[]; 
  colors: Color[];
  descriptions: string[];
  isRainy: boolean;
  isCold: boolean;
  isHot: boolean;
} => {
  let categories: ClothingCategory[] = [];
  let colors: Color[] = [];
  let descriptions: string[] = [];
  let isRainy = weatherCondition.toLowerCase().includes("rain") || 
                weatherCondition.includes("مطر") || 
                weatherCondition.includes("أمطار");
  
  let isCold = temperature < 15;
  let isHot = temperature > 30;
  
  // Temperature based logic - محسن مع اختيارات أكثر تطوراً
  if (temperature < 5) {
    // جو شديد البرودة
    categories = ["jackets", "jackets", "pants", "shoes", "accessories"]; 
    colors = ["black", "gray", "blue", "brown", "red"]; 
    descriptions = [
      "معطف شتوي سميك",
      "سترة صوفية دافئة",
      "بنطلون قماش سميك",
      "حذاء شتوي مقاوم للماء",
      "وشاح دافئ"
    ];
  } else if (temperature < 10) {
    // جو بارد جداً
    categories = ["jackets", "shirts", "pants", "shoes", "accessories"];
    colors = ["black", "blue", "gray", "brown", "white"];
    descriptions = [
      "معطف شتوي دافئ",
      "قميص بأكمام طويلة",
      "بنطلون جينز سميك",
      "حذاء شتوي مريح",
      "قبعة صوفية"
    ];
  } else if (temperature < 15) {
    // جو بارد
    categories = ["jackets", "shirts", "pants", "shoes"];
    colors = ["brown", "green", "blue", "black"];
    descriptions = [
      "جاكيت دافئ",
      "قميص بأكمام طويلة",
      "بنطلون جينز",
      "حذاء رياضي"
    ];
  } else if (temperature < 20) {
    // جو معتدل يميل للبرودة
    categories = ["jackets", "shirts", "pants", "shoes"];
    colors = ["blue", "white", "black", "brown"];
    descriptions = [
      "جاكيت خفيف",
      "قميص قطني",
      "بنطلون جينز مريح",
      "حذاء رياضي"
    ];
  } else if (temperature < 25) {
    // جو معتدل
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "blue", "brown"];
    descriptions = [
      "قميص قطني بأكمام قصيرة",
      "بنطلون خفيف",
      "حذاء رياضي مريح"
    ];
  } else if (temperature < 30) {
    // جو دافئ
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "blue", "blue"];
    descriptions = [
      "تيشيرت قطني خفيف",
      "بنطلون قصير",
      "حذاء رياضي خفيف"
    ];
  } else if (temperature < 35) {
    // جو حار
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "blue", "brown"];
    descriptions = [
      "تيشيرت قطني خفيف جداً",
      "شورت قصير",
      "صندل مريح"
    ];
  } else {
    // جو شديد الحرارة
    categories = ["shirts", "pants", "shoes"];
    colors = ["white", "white", "white"];
    descriptions = [
      "تيشيرت قطني فضفاض",
      "شورت قصير جداً",
      "صندل خفيف"
    ];
  }

  // تعديلات بناءً على حالة الطقس
  if (isRainy) {
    // تعديلات لحالات المطر
    categories = categories.map(c => {
      if (c === "jackets" && !categories.includes("jackets")) {
        return "jackets";
      }
      return c;
    });
    
    if (!categories.includes("jackets")) {
      categories.splice(0, 0, "jackets");
      colors.splice(0, 0, "blue");
      descriptions.splice(0, 0, "جاكيت مقاوم للماء");
    }
    
    descriptions = descriptions.map(d => {
      if (d.includes("حذاء")) {
        return "حذاء مقاوم للماء";
      } else if (d.includes("صندل")) {
        return "حذاء مغلق مقاوم للماء";
      }
      return d;
    });
  }

  // تعديلات إضافية للطقس
  if (weatherCondition.toLowerCase().includes("snow") || weatherCondition.includes("ثلج")) {
    // تعديلات لحالات الثلج
    categories = ["jackets", "jackets", "pants", "shoes", "accessories"];
    colors = ["black", "gray", "blue", "black", "red"];
    descriptions = [
      "معطف شتوي سميك",
      "سترة صوفية دافئة",
      "بنطلون شتوي سميك",
      "حذاء ثلجي مقاوم للماء",
      "قفازات وقبعة صوفية"
    ];
  } else if (weatherCondition.toLowerCase().includes("wind") || weatherCondition.includes("رياح")) {
    // تعديلات لحالات الرياح
    if (!categories.includes("jackets")) {
      categories.splice(0, 0, "jackets");
      colors.splice(0, 0, "blue");
      descriptions.splice(0, 0, "جاكيت مقاوم للرياح");
    }
  }

  return { categories, colors, descriptions, isRainy, isCold, isHot };
};

export async function generateOutfitRecommendation(
  weatherCondition: string,
  temperature: number,
  date: string,
  userClothingItems?: ClothingItem[]
): Promise<AIOutfitResponse> {
  try {
    const { categories, colors, descriptions, isRainy, isCold, isHot } = getWeatherBasedClothing(temperature, weatherCondition);
    
    // توليد الصور لكل قطعة ملابس
    const outfitItems = await Promise.all(categories.map(async (category, index) => {
      const color = colors[index % colors.length];
      const description = descriptions[index] || `قطعة من فئة ${category}`;
      
      // توليد صورة SVG لقطعة الملابس
      const itemSvg = await getClothingItemImage(
        category,
        color,
        description,
        weatherCondition
      );
      
      // تحويل SVG إلى Data URL
      const imageUrl = svgToDataUrl(itemSvg);
      
      return {
        category,
        description,
        color,
        image: imageUrl
      };
    }));
    
    // توليد صورة للإطلالة كاملة
    const outfitSvg = generateOutfitImage(outfitItems);
    const outfitImageUrl = svgToDataUrl(outfitSvg);
    
    // إضافة معلومات سياقية للوصف بناءً على التحليل
    let contextualDescription = `إطلالة مريحة ومناسبة للطقس ${weatherCondition} ودرجة حرارة ${temperature}°C. `;
    
    if (isCold) {
      contextualDescription += "هذه الإطلالة مصممة لتوفير الدفء في الطقس البارد مع الحفاظ على الأناقة. ";
    } else if (isHot) {
      contextualDescription += "اخترنا لك قطع خفيفة ومريحة لمساعدتك على مواجهة الطقس الحار. ";
    }
    
    if (isRainy) {
      contextualDescription += "تم تضمين قطع مقاومة للماء لحمايتك من المطر. ";
    }
    
    contextualDescription += "تم اختيار الألوان المتناسقة لضمان إطلالة أنيقة ومتكاملة.";
    
    // Create a basic outfit based on weather with images
    const outfit = {
      name: `إطلالة مناسبة لـ ${temperature}°C و${weatherCondition}`,
      description: contextualDescription,
      items: outfitItems,
      outfitImage: outfitImageUrl
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
    // الحصول على الإطلالة المناسبة للمناسبة
    const baseOutfit = getOccasionBasedOutfit(occasion, preferences);
    
    // توليد الصور لكل قطعة ملابس في الإطلالة
    const outfitItems = await Promise.all(baseOutfit.items.map(async (item) => {
      // توليد صورة SVG لقطعة الملابس
      const itemSvg = await getClothingItemImage(
        item.category,
        item.color,
        item.description,
        undefined // لا يوجد طقس محدد للمناسبة
      );
      
      // تحويل SVG إلى Data URL
      const imageUrl = svgToDataUrl(itemSvg);
      
      return {
        ...item,
        image: imageUrl
      };
    }));
    
    // توليد صورة للإطلالة كاملة
    const outfitSvg = generateOutfitImage(outfitItems);
    const outfitImageUrl = svgToDataUrl(outfitSvg);
    
    const outfit = {
      name: baseOutfit.name,
      description: baseOutfit.description,
      items: outfitItems,
      outfitImage: outfitImageUrl
    };
    
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
    const baseOutfit = createOutfitFromWardrobe(clothingItems, occasion, weather);
    
    // توليد الصور لكل قطعة ملابس في الإطلالة
    const outfitItems = await Promise.all(baseOutfit.items.map(async (item) => {
      // توليد صورة SVG لقطعة الملابس
      const itemSvg = await getClothingItemImage(
        item.category,
        item.color,
        item.description,
        weather?.condition
      );
      
      // تحويل SVG إلى Data URL
      const imageUrl = svgToDataUrl(itemSvg);
      
      return {
        ...item,
        image: imageUrl
      };
    }));
    
    // توليد صورة للإطلالة كاملة
    const outfitSvg = generateOutfitImage(outfitItems);
    const outfitImageUrl = svgToDataUrl(outfitSvg);
    
    // إنشاء الإطلالة النهائية مع الصور
    const enhancedOutfit = {
      name: baseOutfit.name,
      description: baseOutfit.description,
      items: outfitItems,
      outfitImage: outfitImageUrl
    };
    
    // إضافة بعض المعلومات الإضافية للوصف
    let enhancedDescription = baseOutfit.description;
    if (weather) {
      enhancedDescription += " تم اختيار هذه القطع لتناسب درجة الحرارة والظروف الجوية الحالية.";
    }
    if (occasion) {
      enhancedDescription += ` تم مراعاة مناسبة ${occasion} عند تكوين هذه الإطلالة.`;
    }
    
    return {
      success: true,
      outfit: {
        ...enhancedOutfit,
        description: enhancedDescription
      }
    };
  } catch (error) {
    console.error("Error generating outfit from wardrobe items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "فشل في إنشاء إطلالة من خزانة ملابسك"
    };
  }
}
