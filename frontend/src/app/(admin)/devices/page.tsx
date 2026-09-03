"use client";

import { useState } from "react";
import { MonitorPlay } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { DevicesTable, Device } from "@/components/admin/global/devices/DevicesTable";

export default function DevicesPage() {
  const { data, isLoading } = useApi('/admin/devices');
  
  const devices: Device[] = data?.data || [];

  const handleRevoke = (device: Device) => {
    alert(`Se ha cerrado la sesión del dispositivo: ${device.device_name} (IP: ${device.ip_address})`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispositivos Activos</h1>
          <p className="text-gray-400 mt-1">
            Monitorea las sesiones activas de tus usuarios y revoca accesos de ser necesario.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-surface-dark hover:bg-black/40 text-white border border-white/10 px-5 py-2.5 rounded-xl font-medium transition-colors">
          <MonitorPlay size={20} />
          <span>Filtros Globales</span>
        </button>
      </div>

      <div className="glass-panel p-4 flex gap-4">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Buscar por correo o IP..." 
            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent"
          />
        </div>
      </div>

      <DevicesTable 
        devices={devices} 
        loading={isLoading}
        onRevoke={handleRevoke}
      />
    </div>
  );
}
