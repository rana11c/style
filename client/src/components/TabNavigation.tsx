import React from "react";
import { ActiveTab } from "../types";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center overflow-x-auto pb-2 space-x-2">
        <button 
          className={`${activeTab === "weather" ? "bg-primary text-white" : "bg-neutral text-accent"} px-6 py-2 rounded-full text-sm font-semibold`}
          onClick={() => onChangeTab("weather")}
        >
          الطقس 🌞: ذكاء الاصطناعي
        </button>
        <button 
          className={`${activeTab === "occasions" ? "bg-primary text-white" : "bg-neutral text-accent"} px-6 py-2 rounded-full text-sm font-semibold`}
          onClick={() => onChangeTab("occasions")}
        >
          المناسبات
        </button>
        <button 
          className={`${activeTab === "saved" ? "bg-primary text-white" : "bg-neutral text-accent"} px-6 py-2 rounded-full text-sm font-semibold`}
          onClick={() => onChangeTab("saved")}
        >
          المحفوظة
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
