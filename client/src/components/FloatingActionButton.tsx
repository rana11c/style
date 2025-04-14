import React from "react";
import { PlusIcon } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 inset-x-0 flex justify-center z-30">
      <button 
        className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        onClick={onClick}
      >
        <PlusIcon className="h-8 w-8" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
