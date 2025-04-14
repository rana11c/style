import React from "react";
import { ClothingItem as ClothingItemType } from "@shared/schema";

interface ClothingItemProps {
  item: ClothingItemType;
  onClick?: () => void;
}

// Mapping of color strings to TailwindCSS classes
const colorMap: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border border-gray-300",
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  brown: "bg-yellow-800",
  gray: "bg-gray-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  other: "bg-gray-400",
};

// Season emoji map
const seasonEmoji: Record<string, string> = {
  summer: "☀️",
  winter: "❄️",
  fall: "🍂",
  spring: "🌸",
};

const ClothingItem: React.FC<ClothingItemProps> = ({ item, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      {item.imageUrl ? (
        <div className="relative h-40">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          <span className="text-4xl">{item.category === "shirts" ? "👕" : item.category === "pants" ? "👖" : "👟"}</span>
        </div>
      )}
      
      <div className="p-3">
        <h3 className="font-semibold mb-2">{item.name}</h3>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {item.colors.slice(0, 3).map((color, idx) => (
              <div 
                key={idx} 
                className={`w-4 h-4 rounded-full ${colorMap[color] || "bg-gray-400"}`}
              ></div>
            ))}
            {item.colors.length > 3 && <span className="text-xs">+{item.colors.length - 3}</span>}
          </div>
          
          <div className="flex space-x-1">
            {item.seasons.slice(0, 2).map((season, idx) => (
              <span key={idx}>{seasonEmoji[season] || "🏷️"}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingItem;
