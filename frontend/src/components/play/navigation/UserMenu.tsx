"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

interface ProfileData {
  id: number;
  name: string;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [activeProfile, setActiveProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch auth status
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setActiveProfile(data.activeProfile);
        }
      } catch (e) {
        console.error("Auth me error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 transition-all">
          Ingresar
        </Link>
        <Link href="/register" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-500/20 transition-all" style={{ backgroundColor: 'var(--accent)' }}>
          Registro
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative block outline-none group"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 ring-2 ring-white/10 group-hover:ring-accent transition-all overflow-hidden">
          {/* Avatar placeholder */}
          <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} width={40} height={40} unoptimized />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-[#121418] rounded-xl shadow-2xl border border-white/10 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-white/5 mb-2">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
              Perfil Activo
            </p>
            <p className="text-sm text-white font-bold truncate mt-1">
              {activeProfile ? activeProfile.name : user.name}
            </p>
          </div>

          <Link href="/profiles" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cambiar Perfil
          </Link>

          <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Configuración
          </Link>

          <div className="h-px bg-white/5 my-1"></div>

          <button 
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}


