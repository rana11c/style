import React from "react";
import { ShirtIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-8 bg-neutral bg-opacity-30 rounded-lg">
      <div className="flex justify-center mb-4">
        <ShirtIcon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <button 
        className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center mx-auto"
        onClick={onAction}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {actionText}
      </button>
    </div>
  );
};

export default EmptyState;
