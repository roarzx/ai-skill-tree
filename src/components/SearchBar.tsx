'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索技能..."
        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg 
                   text-slate-200 placeholder-slate-500 text-sm
                   focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30
                   transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 
                     transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
