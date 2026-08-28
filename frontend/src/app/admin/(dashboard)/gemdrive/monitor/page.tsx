"use client";

import { useState, useEffect } from "react";
import { Activity, Server, CheckCircle2, XCircle, HardDrive } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface MonitorStats {
  active_sources: number;
  running_syncs: number;
  completed_syncs: number;
  failed_syncs: number;
  last_files: number;
}

export default function GemDriveMonitorPage() {
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch("/api/admin/drive/monitor");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Fuentes Activas",
      value: stats?.active_sources || 0,
      icon: HardDrive,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      description: "Catálogos indexados"
    },
    {
      title: "Syncs Corriendo",
      value: stats?.running_syncs || 0,
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      description: "Procesos del worker actuales"
    },
    {
      title: "Syncs Completados",
      value: stats?.completed_syncs || 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      description: "Histórico finalizado con éxito"
    },
    {
      title: "Syncs Fallidos",
      value: stats?.failed_syncs || 0,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      description: "Histórico de errores"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-accent" />
            Monitor de Sincronización
          </h1>
          <p className="text-gray-400 mt-1">Supervisa en tiempo real el worker de Google Drive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-xl border border-surface-border">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={card.color} size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-6 rounded-xl border border-surface-border">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="text-accent" size={20} />
          Estado del Worker de Archivos
        </h2>
        <div className="bg-surface-dark rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-300">
            <span className="text-emerald-400">●</span> Última respuesta: <span className="text-white">Hace unos segundos</span>
          </p>
          <p className="text-gray-300 mt-2">
            Últimos archivos procesados: <span className="font-bold text-accent">{stats?.last_files || 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
