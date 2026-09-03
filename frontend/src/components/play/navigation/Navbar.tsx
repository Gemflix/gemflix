"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavDropdown, NavDropdownItem, NavDropdownDivider } from './NavDropdown';
import { UserMenu } from './UserMenu';
import { useTheme } from '@/app/play/ThemeProvider';
import { SearchModal } from './SearchModal';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <Link href="/" className="shrink-0 transition-transform hover:scale-105 relative group">
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
        <nav className="flex-1 hidden xl:flex items-center gap-1.5 2xl:gap-2">
          
          {/* 1. EXPLORAR */}
          <NavDropdown label="Explorar">
            <NavDropdownItem href="/movies" emoji="🍿" variantClass="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10">Películas</NavDropdownItem>
            <NavDropdownItem href="/series" emoji="📺" variantClass="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10">Series</NavDropdownItem>
            <NavDropdownItem href="/collections" emoji="🗂️" variantClass="text-gray-300 hover:text-purple-400 hover:bg-purple-500/10">Colecciones</NavDropdownItem>
            <NavDropdownItem href="/casts" emoji="🎭" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Actores</NavDropdownItem>
          </NavDropdown>

          {/* 2. ESTRENOS */}
          <Link href="/calendar" className="group px-3 py-2 text-sm font-bold text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-yellow-400/30">
            <span className="group-hover:scale-125 transition-transform duration-300 origin-bottom">📅</span>
            <span>Estrenos</span>
          </Link>

          {/* 3. EVENTOS EN VIVO */}
          <Link href="/events" className="group px-3 py-2 text-sm font-bold text-orange-500 hover:text-white hover:bg-orange-500/20 rounded-lg transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-orange-500/30 shadow-[0_0_0_rgba(249,115,22,0)] hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_5px_#f97316]"></span>
            </span>
            <span className="group-hover:scale-125 transition-transform duration-300 origin-bottom relative z-10">🔴</span>
            <span className="relative z-10">Eventos</span>
          </Link>

          {/* 4. IPTV */}
          <NavDropdown label="IPTV">
            <NavDropdownItem href="/livetv" emoji="📡" variantClass="text-gray-300 hover:text-red-400 hover:bg-red-500/10 font-bold">TV en Vivo</NavDropdownItem>
            <NavDropdownItem href="/iptv" emoji="📋" variantClass="text-gray-300 hover:text-red-400 hover:bg-red-500/10 font-bold">IPTV List</NavDropdownItem>
          </NavDropdown>

          {/* 5. ARCADE */}
          <NavDropdown label="Arcade 🎮" labelClass="group-hover:text-amber-400 font-bold">
            <NavDropdownItem href="/arcade" emoji="🕹️" variantClass="text-white hover:text-amber-300 hover:bg-amber-500/20 font-bold">Hub del Arcade</NavDropdownItem>
            <NavDropdownDivider />
            <NavDropdownItem href="/arcade/roulette" emoji="🎡" variantClass="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 font-bold">Ruleta de la Fortuna</NavDropdownItem>
            <NavDropdownItem href="/arcade/slots" emoji="🎰" variantClass="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold">Tragamonedas</NavDropdownItem>
            <NavDropdownItem href="/arcade/scratch" emoji="🎫" variantClass="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 font-bold">Rasca y Gana</NavDropdownItem>
            <NavDropdownItem href="/arcade/trivia" emoji="🧠" variantClass="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-bold">Trivia Cine/Series</NavDropdownItem>
            <NavDropdownItem href="/arcade/flappy" emoji="🐦" variantClass="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 font-bold">Flappy Bird</NavDropdownItem>
          </NavDropdown>

          {/* 6. SOPORTE E INTERACCION */}
          <NavDropdown label="Soporte">
            <NavDropdownItem href="/requests" emoji="📝" variantClass="text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10">Pedidos</NavDropdownItem>
            <NavDropdownItem href="/reports" emoji="🚩" variantClass="text-gray-300 hover:text-rose-400 hover:bg-rose-500/10">Reportes</NavDropdownItem>
            <NavDropdownDivider />
            <NavDropdownItem href="/resources" emoji="📚" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Recursos (Play)</NavDropdownItem>
            <NavDropdownItem href="/tutorials" emoji="🎓" variantClass="text-gray-300 hover:text-blue-400 hover:bg-blue-500/10">Tutoriales</NavDropdownItem>
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

          {/* Botón Planes */}
          <Link href="/pricing" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-105 hover:shadow-purple-500/40 transition-all duration-300">
            👑 Planes
          </Link>

          {/* Menu de Usuario */}
          <UserMenu />

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="xl:hidden p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[#121418] border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link href="/movies" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 font-medium hover:text-white">🍿 Películas</Link>
              <Link href="/series" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 font-medium hover:text-white">📺 Series</Link>
              <Link href="/calendar" onClick={() => setMobileMenuOpen(false)} className="text-yellow-400 font-bold hover:text-yellow-300">📅 Estrenos</Link>
              <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="text-orange-500 font-bold hover:text-orange-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_5px_#f97316]"></span>
                </span>
                Eventos
              </Link>
              <Link href="/livetv" onClick={() => setMobileMenuOpen(false)} className="text-red-400 font-bold hover:text-red-300">📡 IPTV en Vivo</Link>
              <Link href="/arcade" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 font-bold hover:text-amber-300">🎮 Arcade Hub</Link>
              <div className="h-px w-full bg-white/5 my-2"></div>
              <Link href="/requests" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">📝 Pedidos</Link>
              <Link href="/reports" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">🚩 Reportes</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
