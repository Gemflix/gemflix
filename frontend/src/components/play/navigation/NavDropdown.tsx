import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface NavDropdownProps {
  label: string;
  children: React.ReactNode;
}

export function NavDropdown({ label, children }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="relative group" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 group-hover:text-cyan-400 focus:outline-none"
      >
        {label}
        <svg 
          className={`w-4 h-4 transition-transform duration-300 group-hover:text-cyan-500 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="w-56 rounded-xl bg-[#121418] shadow-2xl border border-white/10 py-2 origin-top-left animate-in slide-in-from-top-2 fade-in duration-200">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface NavDropdownItemProps {
  href: string;
  emoji: string;
  children: React.ReactNode;
  variantClass?: string;
}

export function NavDropdownItem({ href, emoji, children, variantClass = "text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10" }: NavDropdownItemProps) {
  return (
    <Link 
      href={href}
      className={`block px-4 py-2.5 text-sm transition-all duration-300 flex items-center gap-3 ${variantClass}`}
    >
      <span className="text-lg">{emoji}</span>
      {children}
    </Link>
  );
}

export function NavDropdownDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />;
}
