import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import FloatingActionButton from "../components/FloatingActionButton";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import { ShoppingItem as ShoppingItemType } from "@shared/schema";
import { getDefaultWeather } from "../lib/weather";

const ShoppingItem: React.FC<{ item: ShoppingItemType }> = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative">
        <img 
          src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} 
          alt={item.name} 
          className="w-full h-40 object-cover" 
        />
        <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-lg">
          يناسب خزانتك
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">{item.price} ريال</span>
          <span className="text-xs text-gray-500">{item.brand}</span>
        </div>
      </div>
    </div>
  );
};

const Shopping: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("recommendations");

  // Get current date in Arabic format
  const currentDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Default weather data (would be fetched from API in real app)
  const defaultWeather = getDefaultWeather().today;

  // Query shopping items
  const { data: shoppingItems, isLoading } = useQuery({
    queryKey: ['/api/shopping/items'],
    queryFn: async () => {
      // Mock data - in a real app this would come from API
      return [
        {
          id: 1,
          name: "قميص كلاسيكي أزرق",
          price: 299,
          brand: "ركة الأناقة",
          category: "shirts",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
          colors: ["blue"],
          compatibleWith: [1, 3, 5],
        },
        {
          id: 2,
          name: "بنطال كلاسيكي بيج",
          price: 349,
          brand: "ركة ستايل",
          category: "pants",
          imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
          colors: ["beige"],
          compatibleWith: [2, 4],
        },
        {
          id: 3,
          name: "جاكيت أنيق بني",
          price: 599,
          brand: "ركة لوكس",
          category: "jackets",
          imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&auto=format&fit=crop&q=60",
          colors: ["brown"],
          compatibleWith: [1, 2],
        },
        {
          id: 4,
          name: "حزام جلد كلاسيكي",
          price: 149,
          brand: "ركة كلاسيك",
          category: "accessories",
          imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&auto=format&fit=crop&q=60",
          colors: ["black"],
          compatibleWith: [1, 2, 3],
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const filters = [
    { id: "recommendations", label: "توصيات لك ✨" },
    { id: "popular", label: "الأكثر رواجاً 👕" },
    { id: "favorites", label: "المفضلة ❤️" },
  ];

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Filter shopping items based on search
  const filteredItems = (shoppingItems as ShoppingItemType[] || []).filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header 
        weather={defaultWeather}
        date={currentDate}
      />
      
      <div className="pt-4 pb-16">
        <div className="px-4">
          <h2 className="text-lg font-bold mb-4">تسوق</h2>
          
          <SearchBar 
            placeholder="...ابحث عن منتجات"
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <CategoryFilter 
            categories={filters}
            activeCategory={activeFilter}
            onSelectCategory={handleFilterSelect}
          />
          
          <h2 className="text-lg font-bold mb-4">توصيات مناسبة لخزانتك</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <ShoppingItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral bg-opacity-30 rounded-lg p-8 text-center">
              <p className="text-gray-600">لم يتم العثور على منتجات تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>
      
      <FloatingActionButton onClick={() => {}} />
      <BottomNavigation />
    </div>
  );
};

export default Shopping;
