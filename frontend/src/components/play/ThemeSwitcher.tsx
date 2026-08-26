"use client";

import { useState } from "react";
import { Palette, Monitor, Sun, Moon, Sparkles, Check } from "lucide-react";
import { useTheme } from "@/app/play/ThemeProvider";

const PRESET_THEMES = [
  {
    id: "admin",
    name: "Original (App)",
    icon: Monitor,
    config: null // Null means it will reset to globalTheme
  },
  {
    id: "dark-cinema",
    name: "Cine Oscuro",
    icon: Moon,
    config: {
      primaryColor: "#e50914",
      backgroundColor: "#000000",
      borderRadius: "0.25rem",
    }
  },
  {
    id: "neon",
    name: "Cyber Neón",
    icon: Sparkles,
    config: {
      primaryColor: "#00ff9d",
      backgroundColor: "#09090b",
      borderRadius: "9999px",
    }
  },
  {
    id: "ocean",
    name: "Océano Profundo",
    icon: Sun, // Just an icon
    config: {
      primaryColor: "#38bdf8",
      backgroundColor: "#082f49",
      borderRadius: "1rem",
    }
  }
];

export function ThemeSwitcher() {
  const { theme, setTheme, resetTheme, isLocalOverride } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectPreset = (preset: typeof PRESET_THEMES[0]) => {
    if (preset.id === "admin") {
      resetTheme();
    } else {
      setTheme({
        ...theme, // keep logoUrl
        ...preset.config
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10 shadow-lg backdrop-blur-md"
        title="Personalizar Tema"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Tema</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1a1c23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <h3 className="text-sm font-bold text-white">Elige tu Vibe</h3>
            <p className="text-xs text-gray-400">Personaliza tu experiencia</p>
          </div>
          
          <div className="flex flex-col gap-1">
            {PRESET_THEMES.map((preset) => {
              const Icon = preset.icon;
              
              // Determinar si está activo
              // Si isLocalOverride es false, el activo es "admin"
              // Si isLocalOverride es true, verificamos colores
              let isActive = false;
              if (preset.id === "admin" && !isLocalOverride) isActive = true;
              else if (
                isLocalOverride && 
                preset.config && 
                theme.primaryColor === preset.config.primaryColor &&
                theme.backgroundColor === preset.config.backgroundColor
              ) {
                isActive = true;
              }

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center border border-white/10"
                      style={preset.config ? { backgroundColor: preset.config.primaryColor } : { backgroundColor: 'var(--accent)' }}
                    >
                      <Icon className="w-3 h-3 text-white mix-blend-difference" />
                    </div>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
