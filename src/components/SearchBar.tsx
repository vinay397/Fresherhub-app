import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search jobs, companies, skills... (e.g., React, Frontend, TechCorp)"
        className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <Sparkles className="h-5 w-5 text-purple-400" />
      </div>
    </div>
  );
};

export default SearchBar;