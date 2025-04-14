import React from "react";
import { AIOutfitResponse } from "../types";
import { RefreshCw } from "lucide-react";

interface OutfitRecommendationProps {
  outfit: AIOutfitResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// تحويل اسم الفئة إلى العربية
const arabicCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    "shirts": "قميص",
    "pants": "بنطلون",
    "shoes": "حذاء",
    "jackets": "جاكيت",
    "accessories": "إكسسوار"
  };
  return categoryNames[category] || category;
};

// تحويل اسم اللون إلى العربية
const arabicColorName = (color: string): string => {
  const colorNames: Record<string, string> = {
    "white": "أبيض",
    "black": "أسود",
    "blue": "أزرق",
    "red": "أحمر",
    "green": "أخضر",
    "yellow": "أصفر",
    "gray": "رمادي",
    "brown": "بني",
    "purple": "بنفسجي",
    "orange": "برتقالي",
    "pink": "وردي"
  };
  return colorNames[color] || color;
};

const OutfitRecommendation: React.FC<OutfitRecommendationProps> = ({
  outfit,
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-4">إطلالة اليوم</h3>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">جاري تحميل الإطلالة...</p>
        </div>
      </div>
    );
  }

  if (error || !outfit || !outfit.success) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-2">إطلالة اليوم</h3>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-error mb-4">حدث خطأ أثناء تحميل الإطلالة</p>
          <button 
            className="bg-primary text-white py-2 px-6 rounded-lg font-semibold"
            onClick={onRetry}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">إطلالة اليوم</h3>
        <button 
          className="text-primary flex items-center"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>تحديث</span>
        </button>
      </div>
      
      {/* صورة الإطلالة الكاملة إذا كانت متوفرة */}
      {outfit.outfit?.outfitImage && (
        <div className="mb-4 flex justify-center">
          <img 
            src={outfit.outfit.outfitImage} 
            alt="الإطلالة كاملة" 
            className="border rounded-lg max-h-64 object-contain"
          />
        </div>
      )}
      
      <div className="bg-primary/10 rounded-lg p-4 mb-4">
        <h4 className="font-bold mb-2">{outfit.outfit?.name}</h4>
        <p className="text-sm">{outfit.outfit?.description}</p>
      </div>
      
      <div className="space-y-4">
        {outfit.outfit?.items.map((item, index) => (
          <div key={index} className="flex items-center p-3 border rounded-lg">
            {/* عرض صورة العنصر إذا كانت متوفرة، وإلا استعمل مربع ملون */}
            {item.image ? (
              <div className="h-16 w-16 mr-3 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.description} 
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full bg-${item.color} mr-3 flex-shrink-0`}></div>
            )}
            <div>
              <p className="font-semibold">{arabicCategoryName(item.category)}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-500">{arabicColorName(item.color)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutfitRecommendation;
