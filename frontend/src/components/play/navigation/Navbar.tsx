"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavDropdown, NavDropdownItem, NavDropdownDivider } from './NavDropdown';
import { UserMenu } from './UserMenu';
import { useTheme } from '@/app/play/ThemeProvider';
import { ThemeSwitcher } from '@/components/play/ThemeSwitcher';
import { SearchModal } from './SearchModal';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 border-b border-transparent ${
        scrolled ? 'bg-[#121418]/90 backdrop-blur-xl border-white/5 shadow-2xl shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-6 h-20 flex items-center justify-between gap-8">
        
        {/* LOGO */}
        <Link href="/play" className="flex-shrink-0 transition-transform hover:scale-105 relative group">
          <div className="absolute -inset-2 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" style={{ backgroundColor: 'var(--accent)' }}></div>
          {theme.logoUrl ? (
            <Image src={theme.logoUrl} alt="GEMFLIX" width={150} height={36} className="h-9 w-auto relative" unoptimized />
          ) : (
            <h1 className="text-2xl font-black tracking-tighter drop-shadow-md relative" style={{ color: "var(--accent)" }}>
              GEMFLIX
            </h1>
          )}
        </Link>

        {/* NAV PRINCIPAL (Desktop Only for now) */}
        <nav className="flex-1 hidden md:flex items-center gap-2">
          
          {/* 1. EXPLORAR */}
          <NavDropdown label="Explorar">
            <NavDropdownItem href="/movies" emoji="🎞️">Películas</NavDropdownItem>
            <NavDropdownItem href="/series" emoji="📺">Series</NavDropdownItem>
            <NavDropdownItem href="/collections" emoji="🗂️" variantClass="text-gray-300 hover:text-purple-400 hover:bg-purple-500/10">Colecciones</NavDropdownItem>
            
            <NavDropdownDivider />
            
            <NavDropdownItem href="/countries" emoji="🌍" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Países</NavDropdownItem>
            <NavDropdownItem href="/networks" emoji="💻" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Plataformas</NavDropdownItem>
            <NavDropdownItem href="/casts" emoji="🎭" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Actores</NavDropdownItem>
            
            <NavDropdownDivider />
            
            <NavDropdownItem href="/requests" emoji="📫" variantClass="text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10">Tabla de Solicitudes</NavDropdownItem>
            <NavDropdownItem href="/reports" emoji="🐞" variantClass="text-gray-300 hover:text-rose-400 hover:bg-rose-500/10">Tabla de Reportes</NavDropdownItem>
          </NavDropdown>

          {/* CALENDARIO Y NOTICIAS */}
          <Link href="/calendar" className="group px-4 py-2 text-sm font-bold text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-yellow-400/30">
            <span className="group-hover:scale-125 transition-transform duration-300 origin-bottom">📅</span>
            <span>Estrenos</span>
          </Link>

          {/* EVENTOS EN VIVO */}
          <Link href="/events" className="group px-4 py-2 text-sm font-bold text-orange-500 hover:text-white hover:bg-orange-500/20 rounded-lg transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-orange-500/30 shadow-[0_0_0_rgba(249,115,22,0)] hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_5px_#f97316]"></span>
            </span>
            <span className="group-hover:scale-125 transition-transform duration-300 origin-bottom relative z-10">⚽</span>
            <span className="relative z-10">Eventos</span>
          </Link>

          {/* IPTV */}
          <NavDropdown label="IPTV">
            <NavDropdownItem href="/livetv" emoji="📺" variantClass="text-gray-300 hover:text-red-400 hover:bg-red-500/10 font-bold">TV en Vivo</NavDropdownItem>
          </NavDropdown>

          {/* ARCADE */}
          <NavDropdown label="Arcade 🕹️">
            <NavDropdownItem href="/arcade" emoji="🎮" variantClass="text-white hover:text-amber-300 hover:bg-amber-500/20 font-bold">Hub del Arcade</NavDropdownItem>
            <NavDropdownDivider />
            <NavDropdownItem href="/arcade/roulette" emoji="🎡" variantClass="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 font-bold">Ruleta de la Fortuna</NavDropdownItem>
            <NavDropdownDivider />
            <NavDropdownItem href="/arcade/leaderboard" emoji="🏆" variantClass="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-bold">Clasificación (Top 10)</NavDropdownItem>
          </NavDropdown>

          {/* PRODUCTOS */}
          <NavDropdown label="Productos">
            <NavDropdownItem href="/drive" emoji="☁️" variantClass="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold">Gem Drive</NavDropdownItem>
          </NavDropdown>

          {/* RECURSOS */}
          <NavDropdown label="Recursos">
            <NavDropdownItem href="/downloads" emoji="📥" variantClass="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold">Descargas</NavDropdownItem>
            <NavDropdownItem href="/tutorials" emoji="🎓" variantClass="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold">Tutoriales</NavDropdownItem>
          </NavDropdown>

        </nav>

        {/* DERECHA: Buscador + Usuario */}
        <div className="flex items-center gap-5 lg:gap-4">
          
          {/* Buscador Rápido */}
          <div 
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 cursor-text hover:border-cyan-500/50 transition-colors w-48 text-gray-400 group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm flex-1 text-left">Buscar...</span>
            <kbd className="hidden sm:inline-block border border-gray-600 bg-gray-800 rounded px-1.5 text-[10px] font-mono text-gray-400 group-hover:text-gray-300">Ctrl K</kbd>
          </div>

          <button onClick={() => setSearchOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <ThemeSwitcher />

          {/* Botón Planes */}
          <Link href="/pricing" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-105 hover:shadow-purple-500/40 transition-all duration-300">
            👑 Planes
          </Link>

          {/* Menu de Usuario */}
          <UserMenu />
        </div>
      </div>
      
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
