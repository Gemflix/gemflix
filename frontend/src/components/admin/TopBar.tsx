"use client";

import { Bell, Search, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-20 w-full glass-panel flex items-center justify-between px-8 sticky top-0 z-50 border-b border-surface-border">
      
      {/* Buscador */}
      <div className="relative w-96 hidden md:block group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar usuarios, películas..." 
          className="w-full bg-slate-900/50 border border-surface-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition-all duration-300 placeholder:text-gray-500 focus:bg-slate-900/80"
        />
      </div>

      {/* Perfil & Acciones */}
      <div className="flex items-center gap-6 ml-auto">
        <button className="relative text-gray-400 hover:text-white transition-colors duration-300">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-surface-border cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <User size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Administrador</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
