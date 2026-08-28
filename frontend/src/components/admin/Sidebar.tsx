"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  MonitorPlay, 
  Settings,
  Palette, 
  LogOut,
  ChevronDown,
  Globe,
  HardDrive,
  PlayCircle,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  Tv,
  ShieldAlert,
  ShieldPlus
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(() => {
    if (pathname.startsWith("/admin/gemflix")) return "gemflix";
    if (pathname.startsWith("/admin/gemdrive")) return "gemdrive";
    if (pathname.startsWith("/admin/jellyfin")) return "jellyfin";
    return "global";
  });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "Catálogo": true });

  useEffect(() => {
    if (pathname.startsWith("/admin/gemflix")) setActiveApp("gemflix");
    else if (pathname.startsWith("/admin/gemdrive")) setActiveApp("gemdrive");
    else if (pathname.startsWith("/admin/jellyfin")) setActiveApp("jellyfin");
    else setActiveApp("global");
  }, [pathname]);

  const toggleSubMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const apps = [
    { id: "global", name: "Panel Global", icon: Globe, color: "from-blue-400 to-indigo-600" },
    { id: "gemflix", name: "Gemflix", icon: Film, color: "from-orange-400 to-red-600" },
    { id: "gemdrive", name: "GemDrive", icon: HardDrive, color: "from-teal-400 to-emerald-600" },
    { id: "jellyfin", name: "Jellyfin", icon: PlayCircle, color: "from-purple-400 to-fuchsia-600" },
  ];

  const currentApp = apps.find(app => app.id === activeApp) || apps[0];

  const getNavItems = () => {
    switch (activeApp) {
      case "gemflix":
        return [
          { 
            name: "Catálogo", 
            icon: Film, 
            subItems: [
              { name: "Películas", href: "/admin/gemflix/movies" },
              { name: "Series", href: "/admin/gemflix/series" },
              { name: "Colecciones", href: "/admin/gemflix/collections" },
              { name: "Redes (Plataformas)", href: "/admin/gemflix/networks" },
              { name: "Géneros", href: "/admin/gemflix/genres" },
              { name: "Reparto (Actores)", href: "/admin/gemflix/casts" },
              { name: "Países", href: "/admin/gemflix/countries" }
            ] 
          },
          { name: "Servidores", href: "/admin/gemflix/servers", icon: HardDrive },
        ];
      case "gemdrive":
        return [
          { 
            name: "Infraestructura Drive TI", 
            icon: HardDrive, 
            subItems: [
              { name: "Monitor de Sincronización", href: "/admin/gemdrive/monitor" },
              { name: "Cuentas de Servicio", href: "/admin/gemdrive/accounts" },
              { name: "Fuentes (Catálogo)", href: "/admin/gemdrive/sources" },
            ] 
          },
        ];
      case "jellyfin":
        return [
          { name: "Sincronización", href: "/admin/jellyfin/sync", icon: PlayCircle },
          { name: "Nodos", href: "/admin/jellyfin/nodes", icon: MonitorPlay },
        ];
      default:
        // global
        return [
          { name: "Dashboard", href: "/", icon: LayoutDashboard }, // Dashboard es "/" en admin.localhost
          { name: "Usuarios", href: "/admin/users", icon: Users },
          { name: "Staff", href: "/admin/staff", icon: ShieldAlert },
          { name: "Roles y Permisos", href: "/admin/roles", icon: ShieldPlus },
          { name: "Dispositivos", href: "/admin/devices", icon: MonitorPlay },
          { name: "Configuración", href: "/admin/settings", icon: Settings },
          { name: "Temas (Play)", href: "/admin/settings/theme", icon: Palette },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`h-screen fixed top-0 left-0 glass-panel flex flex-col border-r border-surface-border z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* App Selector Dropdown / Collapse Button */}
      <div className="p-4 border-b border-surface-border relative flex items-center justify-between">
        {!isCollapsed && (
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex-1 flex items-center justify-between bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-3 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-linear-to-br ${currentApp.color} bg-opacity-20`}>
                <currentApp.icon size={20} className="text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Ecosistema</span>
                <span className="font-bold text-white">{currentApp.name}</span>
              </div>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <div className={`p-2 rounded-lg bg-linear-to-br ${currentApp.color} bg-opacity-20 mb-2`}>
              <currentApp.icon size={20} className="text-white" />
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-20 left-4 right-4 bg-[#1a1c23] border border-surface-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {apps.map((app) => {
              const AppIcon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setActiveApp(app.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 transition-colors duration-200 ${
                    activeApp === app.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`p-1.5 rounded-md bg-linear-to-br ${app.color}`}>
                    <AppIcon size={16} className="text-white" />
                  </div>
                  <span className={`font-medium ${activeApp === app.id ? 'text-white' : 'text-gray-300'}`}>
                    {app.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="mb-4 px-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu Principal
            </span>
          </div>
        )}
        
        {navItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          // Normalize paths for comparison
          const isActive = !hasSubItems && (pathname === item.href || (item.href === "/" && pathname === "/admin"));
          const isSubMenuActive = hasSubItems && item.subItems!.some(sub => pathname.startsWith(sub.href));
          const Icon = item.icon;
          
          if (hasSubItems) {
            const isOpen = openMenus[item.name];
            return (
              <div key={item.name} className="flex flex-col">
                <button 
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false);
                    toggleSubMenu(item.name);
                  }}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-300 group ${
                    isCollapsed ? 'justify-center px-0' : 'px-4'
                  } ${
                    isSubMenuActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white hover:bg-surface-border"
                  }`}
                >
                  <Icon size={20} className={`transition-transform duration-300 shrink-0 ${isSubMenuActive ? 'text-accent' : ''}`} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate flex-1 text-left">{item.name}</span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {(!isCollapsed && isOpen) && (
                  <div className="flex flex-col gap-1 mt-1 mb-2 ml-4 border-l border-white/10 pl-2 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems!.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`py-2 px-4 rounded-lg text-sm transition-colors ${
                          pathname.startsWith(sub.href)
                            ? "bg-accent-light text-accent font-medium"
                            : "text-gray-400 hover:text-white hover:bg-surface-border"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href!}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-300 group ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              } ${
                isActive 
                  ? "bg-accent-light text-accent" 
                  : "text-gray-400 hover:text-white hover:bg-surface-border"
              }`}
            >
              <Icon size={20} className={`transition-transform duration-300 ${!isActive && !isCollapsed && 'group-hover:translate-x-1'} shrink-0`} />
              {!isCollapsed && <span className="font-medium truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-border flex flex-col gap-2">
        <button title={isCollapsed ? "Expandir Menú" : "Contraer Menú"} onClick={() => setIsCollapsed(!isCollapsed)} className={`flex items-center gap-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-surface-border transition-colors duration-300 ${isCollapsed ? 'justify-center w-full px-0' : 'px-4 w-full'}`}>
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          {!isCollapsed && <span className="font-medium truncate">Contraer Panel</span>}
        </button>
        <button title={isCollapsed ? "Cerrar Sesión" : undefined} className={`flex items-center gap-3 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-300 ${isCollapsed ? 'justify-center w-full px-0' : 'px-4 w-full'}`}>
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
