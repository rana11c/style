import React from "react";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`relative mb-4 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="styler-input pl-10"
      />
      <SearchIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-500" />
    </div>
  );
};

export default SearchBar;
