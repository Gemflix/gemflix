"use client";

import { Users, Film, Activity, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats", { credentials: "include" }),
          fetch("/api/admin/users", { credentials: "include" })
        ]);

        if (statsRes.status === 401 || usersRes.status === 401) {
          router.push("/admin/login");
          return;
        }

        const stats = await statsRes.json();
        const users = await usersRes.json();

        setStatsData(stats);
        
        // Protegernos contra respuestas inesperadas (como un 403 Forbidden en formato JSON)
        if (Array.isArray(users)) {
          setRecentUsers(users.slice(0, 5)); // Mostrar solo los 5 más recientes
        } else {
          console.error("Respuesta de usuarios no es un array:", users);
          setRecentUsers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const stats = [
    { title: "Usuarios Totales", value: statsData?.total_users || 0, trend: "+12.5%", isUp: true, icon: Users },
    { title: "Películas & Series", value: statsData?.total_movies || 0, trend: "+4.2%", isUp: true, icon: Film },
    { title: "Dispositivos Activos", value: statsData?.active_devices || 0, trend: "-1.5%", isUp: false, icon: Activity },
    { title: "Ingresos (Mensual)", value: statsData?.total_revenue || "$0", trend: "+24.8%", isUp: true, icon: DollarSign },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-gray-400 mt-1">Bienvenido al panel de control de Gemflix.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className="p-3 bg-accent-light rounded-xl text-accent">
                  <Icon size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                <span className={`flex items-center gap-1 ${stat.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.trend}
                </span>
                <span className="text-gray-500">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla de Usuarios Recientes (Ocupa 2 columnas) */}
        <div className="glass-panel rounded-2xl lg:col-span-2 overflow-hidden border border-surface-border">
          <div className="p-6 border-b border-surface-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Registros Recientes</h3>
            <button className="text-accent text-sm font-medium hover:text-[var(--accent-hover)] transition-colors">
              Ver todos
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/30 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Usuario</th>
                  <th className="px-6 py-4 font-medium">Rol</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-sm">
                {recentUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white group-hover:text-accent transition-colors">{user.name}</span>
                        <span className="text-gray-400 text-xs">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {user.role}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Activo' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel lateral pequeño (Servidor / Uso) */}
        <div className="glass-panel p-6 rounded-2xl border border-surface-border">
          <h3 className="text-lg font-bold text-white mb-6">Estado del Sistema</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-300">Uso de CPU</span>
                <span className="text-accent">42%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-surface-border">
                <div className="bg-gradient-to-r from-orange-400 to-[var(--accent)] h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-300">Memoria RAM (Redis)</span>
                <span className="text-emerald-400">28%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-surface-border">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-300">Almacenamiento (VOD)</span>
                <span className="text-red-400">89%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-surface-border">
                <div className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
