"use client";

import { useState, useEffect } from "react";
import { MonitorPlay, MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/admin/devices", { credentials: "include" });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setDevices(data);
        } else {
          setDevices([]);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dispositivos y Sesiones</h1>
          <p className="text-gray-400">Monitorea los dispositivos conectados y las sesiones activas en el sistema.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar dispositivo..." 
            className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white w-full md:w-64"
          />
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-light rounded-lg">
            <MonitorPlay size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Conexiones Recientes</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-border rounded-lg w-full"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border text-gray-400">
                  <th className="pb-4 font-medium">Usuario</th>
                  <th className="pb-4 font-medium">Dispositivo</th>
                  <th className="pb-4 font-medium">Plataforma</th>
                  <th className="pb-4 font-medium">Dirección IP</th>
                  <th className="pb-4 font-medium">Estado</th>
                  <th className="pb-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {devices.map((device, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{device.user_name}</div>
                    </td>
                    <td className="py-4 text-gray-300">{device.device_brand || "Desconocido"}</td>
                    <td className="py-4 text-gray-300">
                      {device.platform} {device.os_version ? `(${device.os_version})` : ""}
                    </td>
                    <td className="py-4 text-gray-300">{device.last_ip}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        device.status === "Activo" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      }`}>
                        {device.status || "Inactivo"}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No hay dispositivos conectados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
