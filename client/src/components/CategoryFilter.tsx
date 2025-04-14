import React from "react";
import { ClothingCategory } from "@shared/schema";

interface CategoryFilterProps {
  categories: { id: string; label: string }[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`flex-shrink-0 ${
            activeCategory === category.id
              ? "bg-primary text-white rounded-full px-4 py-1 text-sm font-semibold"
              : "bg-white border border-gray-200 rounded-full px-4 py-1 text-sm"
          }`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
