// خدمة توليد الصور للملابس

import path from 'path';
import fs from 'fs/promises';
import { ClothingCategory, Color } from '@shared/schema';

// مجموعة من الصور للفئات المختلفة
interface ClothingImage {
  category: ClothingCategory;
  color: Color;
  occasion?: string; // مناسبة محددة (رسمي، رياضي، إلخ)
  weather?: string; // ظروف الطقس (بارد، حار، إلخ)
  imagePath: string; // مسار الصورة
}

// قاعدة بيانات مبسطة للصور (سنستخدم SVGs فقط للنموذج البرمجي)
// بما أن هذا نموذج أولي، سنستخدم مجموعة محدودة من الألوان والفئات
type SimplifiedColorMap = Partial<Record<Color, string[]>>;
type SimplifiedCategoryMap = Partial<Record<ClothingCategory, SimplifiedColorMap>>;

// قاعدة بيانات للصور مصنفة حسب الفئة واللون
const CLOTHING_IMAGE_DATABASE: SimplifiedCategoryMap = {
  "shirts": {
    "white": [
      "/assets/clothing/shirts/white/formal_shirt.svg",
      "/assets/clothing/shirts/white/casual_tshirt.svg",
    ],
    "black": [
      "/assets/clothing/shirts/black/formal_shirt.svg",
      "/assets/clothing/shirts/black/casual_tshirt.svg",
    ],
    "blue": [
      "/assets/clothing/shirts/blue/casual_shirt.svg",
      "/assets/clothing/shirts/blue/polo.svg",
    ],
    "red": [
      "/assets/clothing/shirts/red/casual_tshirt.svg",
    ],
    "green": [
      "/assets/clothing/shirts/green/casual_shirt.svg",
    ],
    "yellow": [
      "/assets/clothing/shirts/yellow/casual_tshirt.svg",
    ],
    "gray": [
      "/assets/clothing/shirts/gray/casual_tshirt.svg",
      "/assets/clothing/shirts/gray/formal_shirt.svg",
    ],
    "brown": [
      "/assets/clothing/shirts/brown/casual_shirt.svg",
    ],
    "purple": [
      "/assets/clothing/shirts/purple/casual_tshirt.svg",
    ],
  },
  "pants": {
    "blue": [
      "/assets/clothing/pants/blue/jeans.svg",
      "/assets/clothing/pants/blue/formal_pants.svg",
    ],
    "black": [
      "/assets/clothing/pants/black/formal_pants.svg",
      "/assets/clothing/pants/black/casual_pants.svg",
    ],
    "gray": [
      "/assets/clothing/pants/gray/formal_pants.svg",
    ],
    "brown": [
      "/assets/clothing/pants/brown/casual_pants.svg",
    ],
    "white": [
      "/assets/clothing/pants/white/casual_pants.svg",
    ],
    "red": [
      "/assets/clothing/pants/red/casual_pants.svg",
    ],
    "green": [
      "/assets/clothing/pants/green/casual_pants.svg",
    ],
    "yellow": [
      "/assets/clothing/pants/yellow/casual_pants.svg",
    ],
    "purple": [
      "/assets/clothing/pants/purple/casual_pants.svg",
    ],
  },
  "shoes": {
    "black": [
      "/assets/clothing/shoes/black/formal_shoes.svg",
      "/assets/clothing/shoes/black/casual_shoes.svg",
    ],
    "brown": [
      "/assets/clothing/shoes/brown/formal_shoes.svg",
      "/assets/clothing/shoes/brown/casual_shoes.svg",
    ],
    "white": [
      "/assets/clothing/shoes/white/sneakers.svg",
      "/assets/clothing/shoes/white/casual_shoes.svg",
    ],
    "blue": [
      "/assets/clothing/shoes/blue/sneakers.svg",
    ],
    "red": [
      "/assets/clothing/shoes/red/sneakers.svg",
    ],
    "gray": [
      "/assets/clothing/shoes/gray/casual_shoes.svg",
    ],
    "green": [
      "/assets/clothing/shoes/green/casual_shoes.svg",
    ],
    "yellow": [
      "/assets/clothing/shoes/yellow/casual_shoes.svg",
    ],
    "purple": [
      "/assets/clothing/shoes/purple/casual_shoes.svg",
    ],
  },
  "jackets": {
    "black": [
      "/assets/clothing/jackets/black/formal_jacket.svg",
      "/assets/clothing/jackets/black/winter_coat.svg",
    ],
    "blue": [
      "/assets/clothing/jackets/blue/denim_jacket.svg",
      "/assets/clothing/jackets/blue/casual_jacket.svg",
    ],
    "brown": [
      "/assets/clothing/jackets/brown/leather_jacket.svg",
    ],
    "gray": [
      "/assets/clothing/jackets/gray/casual_jacket.svg",
      "/assets/clothing/jackets/gray/winter_coat.svg",
    ],
    "white": [
      "/assets/clothing/jackets/white/casual_jacket.svg",
    ],
    "red": [
      "/assets/clothing/jackets/red/casual_jacket.svg",
    ],
    "green": [
      "/assets/clothing/jackets/green/casual_jacket.svg",
    ],
    "yellow": [
      "/assets/clothing/jackets/yellow/casual_jacket.svg",
    ],
    "purple": [
      "/assets/clothing/jackets/purple/casual_jacket.svg",
    ],
  },
  "accessories": {
    "black": [
      "/assets/clothing/accessories/black/watch.svg",
      "/assets/clothing/accessories/black/belt.svg",
    ],
    "brown": [
      "/assets/clothing/accessories/brown/belt.svg",
      "/assets/clothing/accessories/brown/watch.svg",
    ],
    "blue": [
      "/assets/clothing/accessories/blue/scarf.svg",
    ],
    "red": [
      "/assets/clothing/accessories/red/scarf.svg",
    ],
    "white": [
      "/assets/clothing/accessories/white/scarf.svg",
    ],
    "gray": [
      "/assets/clothing/accessories/gray/scarf.svg",
    ],
    "green": [
      "/assets/clothing/accessories/green/scarf.svg",
    ],
    "yellow": [
      "/assets/clothing/accessories/yellow/scarf.svg",
    ],
    "purple": [
      "/assets/clothing/accessories/purple/scarf.svg",
    ],
  }
};

// مجموعة من SVG للملابس تستخدم كاحتياطي - مبسطة لدعم فقط الفئات الرئيسية
const FALLBACK_SVG_TEMPLATES: Partial<Record<ClothingCategory, string>> = {
  "shirts": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M20,30 L40,10 L60,10 L80,30 L70,35 L70,90 L30,90 L30,35 Z" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
    <path d="M40,10 L50,15 L60,10" fill="none" stroke="black" stroke-width="1"/>
  </svg>`,
  
  "pants": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M30,10 L70,10 L75,90 L55,90 L50,40 L45,90 L25,90 Z" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
    <path d="M30,15 L70,15" fill="none" stroke="black" stroke-width="1"/>
  </svg>`,
  
  "shoes": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M10,60 C10,50 20,50 30,50 L60,50 C80,50 80,60 90,65 L90,75 C90,80 85,80 80,80 L20,80 C15,80 10,75 10,70 Z" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
  </svg>`,
  
  "jackets": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M15,30 L35,10 L65,10 L85,30 L75,40 L75,90 L25,90 L25,40 Z" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
    <path d="M35,10 L35,90" fill="none" stroke="black" stroke-width="1"/>
    <path d="M65,10 L65,90" fill="none" stroke="black" stroke-width="1"/>
    <path d="M50,10 L50,30" fill="none" stroke="black" stroke-width="1"/>
  </svg>`,
  
  "accessories": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="30" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="black" stroke-width="1"/>
    <rect x="45" y="20" width="10" height="5" fill="{{COLOR}}" stroke="black" stroke-width="1"/>
    <rect x="45" y="75" width="10" height="5" fill="{{COLOR}}" stroke="black" stroke-width="1"/>
  </svg>`
};

// تحويل أسماء الألوان إلى قيم CSS
const COLOR_MAP: Partial<Record<string, string>> = {
  "white": "#FFFFFF",
  "black": "#000000",
  "blue": "#2563EB",
  "red": "#DC2626",
  "green": "#10B981",
  "yellow": "#FBBF24",
  "gray": "#6B7280",
  "brown": "#92400E",
  "purple": "#7C3AED",
  // نضيف لونين إضافيين للإكسسوارات
  "silver": "#C0C0C0",
  "gold": "#FFD700"
};

// تنفيذ SVG للصورة المركبة للإطلالة الكاملة
const generateOutfitSVG = (items: { category: ClothingCategory; color: Color; image?: string }[]): string => {
  // إنشاء SVG أساسي
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
    <rect width="300" height="400" fill="#f8f9fa" />
    <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle">إطلالة مقترحة</text>
    <g transform="translate(100, 60)">`;
  
  // ترتيب العناصر: الجاكيت أولاً، ثم القميص، البنطلون، الأحذية
  const orderMap: Partial<Record<ClothingCategory, number>> = {
    "jackets": 1,
    "shirts": 2,
    "pants": 3,
    "shoes": 4,
    "accessories": 5
  };
  
  const sortedItems = [...items].sort((a, b) => {
    const orderA = orderMap[a.category] || 99;
    const orderB = orderMap[b.category] || 99;
    return orderA - orderB;
  });
  
  // إضافة كل عنصر للصورة المركبة
  let yOffset = 0;
  sortedItems.forEach(item => {
    const height = item.category === "jackets" ? 100 : 
                  item.category === "shirts" ? 80 : 
                  item.category === "pants" ? 120 : 
                  item.category === "shoes" ? 40 : 50;
    
    svg += `
    <g transform="translate(0, ${yOffset})">
      <rect x="0" y="0" width="100" height="${height}" fill="none" />
      <text x="-10" y="${height/2}" font-family="Arial" font-size="12" text-anchor="end" dominant-baseline="middle">${arabicCategoryName(item.category)}</text>
      ${generateItemSVG(item.category, item.color)}
    </g>`;
    
    yOffset += height + 10; // إضافة مسافة بين العناصر
  });
  
  svg += `
    </g>
  </svg>`;
  
  return svg;
};

// الحصول على اسم الفئة بالعربية
const arabicCategoryName = (category: ClothingCategory): string => {
  const namesMap: Partial<Record<ClothingCategory, string>> = {
    "shirts": "قميص",
    "pants": "بنطلون",
    "shoes": "حذاء",
    "jackets": "جاكيت",
    "accessories": "إكسسوار"
  };
  return namesMap[category] || String(category);
};

// توليد صورة SVG لعنصر محدد
const generateItemSVG = (category: ClothingCategory, color: Color): string => {
  const colorValue = (COLOR_MAP[color as string] as string) || "#000000";
  
  // القالب الافتراضي في حالة عدم وجود قوالب أخرى
  const defaultTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" fill="{{COLOR}}" stroke="black" stroke-width="2"/>
    <text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="white">${category}</text>
  </svg>`;
  
  // الحصول على القالب المناسب
  let template: string;
  if (category === "shirts" && FALLBACK_SVG_TEMPLATES["shirts"]) {
    template = FALLBACK_SVG_TEMPLATES["shirts"] as string;
  } else if (category === "pants" && FALLBACK_SVG_TEMPLATES["pants"]) {
    template = FALLBACK_SVG_TEMPLATES["pants"] as string;
  } else if (category === "shoes" && FALLBACK_SVG_TEMPLATES["shoes"]) {
    template = FALLBACK_SVG_TEMPLATES["shoes"] as string;
  } else if (category === "jackets" && FALLBACK_SVG_TEMPLATES["jackets"]) {
    template = FALLBACK_SVG_TEMPLATES["jackets"] as string;
  } else if (category === "accessories" && FALLBACK_SVG_TEMPLATES["accessories"]) {
    template = FALLBACK_SVG_TEMPLATES["accessories"] as string;
  } else {
    template = defaultTemplate;
  }
  
  return template.replace(/\{\{COLOR\}\}/g, colorValue);
};

/**
 * الحصول على صورة SVG لقطعة ملابس محددة
 */
export const getClothingItemImage = async (
  category: ClothingCategory, 
  color: Color,
  description?: string,
  weather?: string
): Promise<string> => {
  return generateItemSVG(category, color);
};

/**
 * توليد صورة للإطلالة كاملة
 */
export const generateOutfitImage = (
  items: { 
    category: ClothingCategory; 
    color: Color; 
    description: string;
  }[]
): string => {
  return generateOutfitSVG(items);
};

/**
 * تحويل SVG إلى صيغة Data URL
 */
export const svgToDataUrl = (svg: string): string => {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
};