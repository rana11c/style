import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import FloatingActionButton from "../components/FloatingActionButton";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import EmptyState from "../components/EmptyState";
import ClothingItem from "../components/ClothingItem";
import AddClothingForm from "../components/AddClothingForm";
import { ClothingItem as ClothingItemType } from "@shared/schema";
import { getDefaultWeather } from "../lib/weather";

const Wardrobe: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // Get current date in Arabic format
  const currentDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Default weather data (would be fetched from API in real app)
  const defaultWeather = getDefaultWeather().today;

  // Fetch clothing items from API
  const { data: clothingItems, isLoading } = useQuery({
    queryKey: ['/api/wardrobe/clothing'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = [
    { id: "all", label: "الكل" },
    { id: "shirts", label: "قمصان" },
    { id: "pants", label: "بناطيل" },
    { id: "shoes", label: "أحذية" },
    { id: "jackets", label: "جاكيت" },
    { id: "accessories", label: "اكسسوارات" },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleAddClothingSuccess = () => {
    setShowAddForm(false);
  };

  // Filter clothing items based on search and category
  const filteredItems = (clothingItems as ClothingItemType[] || []).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header 
        weather={defaultWeather}
        date={currentDate}
      />
      
      <div className="pt-4 pb-16">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold mb-4">خزانة ملابسك</h2>
          
          {/* Search in wardrobe */}
          <SearchBar 
            placeholder="...ابحث في خزانتك"
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          {/* Wardrobe filters */}
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="px-4 grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <ClothingItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="px-4">
            <EmptyState 
              title="لا توجد ملابس بعد"
              description={
                searchTerm || activeCategory !== "all"
                  ? "لم يتم العثور على ملابس في هذه الفئة"
                  : "أضف قطع ملابس لتبدأ تنسيق إطلالاتك"
              }
              actionText="إضافة قطعة"
              onAction={() => setShowAddForm(true)}
            />
          </div>
        )}
        
        {showAddForm && (
          <AddClothingForm onSuccess={handleAddClothingSuccess} />
        )}
      </div>
      
      <FloatingActionButton onClick={() => setShowAddForm(!showAddForm)} />
      <BottomNavigation />
    </div>
  );
};

export default Wardrobe;
