import React from 'react';


interface Tab {
  id: string;
  label: string;
}

interface HomeTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TAB_THEMES: Record<string, { icon: string; color: string; shadowActive: string; shadowHover: string }> = {
  movies: {
    icon: '🎬',
    color: 'bg-emerald-600 border-emerald-400',
    shadowActive: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/50',
  },
  series: {
    icon: '📺',
    color: 'bg-blue-600 border-blue-400',
    shadowActive: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/50',
  },
  animes: {
    icon: '⛩️',
    color: 'bg-pink-600 border-pink-400',
    shadowActive: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:border-pink-500/50',
  },
  novelas: {
    icon: '📖',
    color: 'bg-rose-600 border-rose-400',
    shadowActive: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:border-rose-500/50',
  },
  donghuas: {
    icon: '🐉',
    color: 'bg-purple-600 border-purple-400',
    shadowActive: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-500/50',
  },
  doramas: {
    icon: '🎎',
    color: 'bg-amber-600 border-amber-400',
    shadowActive: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-500/50',
  },
  "series-lives": {
    icon: '🎭',
    color: 'bg-cyan-600 border-cyan-400',
    shadowActive: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-500/50',
  },
};

const DEFAULT_THEME = {
  icon: '📁',
  color: 'bg-gray-600 border-gray-400',
  shadowActive: 'shadow-[0_0_20px_rgba(156,163,175,0.4)]',
  shadowHover: 'hover:shadow-[0_0_15px_rgba(156,163,175,0.15)] hover:border-gray-500/50',
};

export function HomeTabs({ tabs, activeTab, onTabChange }: HomeTabsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-3 justify-center md:justify-start relative z-20 px-4 md:px-12">
      <div className="w-full flex flex-nowrap gap-3 overflow-x-auto no-scrollbar items-center py-4 snap-x snap-mandatory">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const theme = TAB_THEMES[tab.id] || DEFAULT_THEME;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 snap-start relative whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border flex items-center gap-2 select-none group outline-none
                ${
                  isActive
                    ? `${theme.color} text-white scale-105 z-10 ${theme.shadowActive}`
                    : `bg-gray-800/60 text-gray-400 border-white/10 hover:bg-gray-700 hover:text-white backdrop-blur-md ${theme.shadowHover}`
                }`}
            >
              <span className="text-lg filter drop-shadow-sm group-hover:scale-110 transition-transform">
                {theme.icon}
              </span>
              {tab.label}
              
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-white/20 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
