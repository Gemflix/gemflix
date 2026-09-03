"use client";

import { Users, Film, HardDrive, DollarSign, Activity, Server, Clock, Database } from "lucide-react";
import { useApi } from "@/hooks/useApi";

export default function DashboardPage() {
  // Simulación de estadísticas globales
  const stats = [
    { label: "Usuarios Totales", value: "14,230", trend: "+12%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Películas & Series", value: "8,459", trend: "+5%", icon: Film, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Tráfico (TB)", value: "245.8", trend: "+18%", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Ingresos (Mes)", value: "$4,290", trend: "+2%", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const systemHealth = [
    { name: "GemDrive API", status: "Operacional", icon: HardDrive, color: "text-emerald-400" },
    { name: "Scrapers (TMDB)", status: "Operacional", icon: Database, color: "text-emerald-400" },
    { name: "Jellyfin Sync", status: "Sincronizando...", icon: Server, color: "text-amber-400" },
    { name: "Nodos de Respaldo", status: "Operacional", icon: Clock, color: "text-emerald-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Global</h1>
        <p className="text-gray-400">Resumen del estado y métricas de toda la plataforma Gemflix.</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Simulado */}
        <div className="lg:col-span-2 glass-panel p-6 min-h-100 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Tráfico de Visualizaciones (7 Días)</h2>
          <div className="flex-1 border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative overflow-hidden">
             {/* Barras de gráfico simuladas con CSS */}
             <div className="absolute inset-0 p-8 flex items-end justify-between gap-2 opacity-50">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="w-full bg-accent/30 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className="w-full bg-accent rounded-t-sm" style={{ height: '4px' }}></div>
                  </div>
                ))}
             </div>
             <span className="relative text-gray-500 font-medium z-10 bg-[#1a1c23]/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/5">
                Gráficos Dinámicos próximamente (Recharts)
             </span>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-6">Estado de Servicios</h2>
          <div className="space-y-4">
            {systemHealth.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <service.icon size={18} className="text-gray-400" />
                  <span className="text-gray-200 font-medium">{service.name}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${service.color}`}>
                  <span className={`w-2 h-2 rounded-full ${service.color.replace('text-', 'bg-')}`}></span>
                  {service.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
