"use client";

import { useApi } from "@/hooks/useApi";
import { Globe, Smartphone, Compass, Monitor, Terminal, Activity } from "lucide-react";
import { SummaryWidget } from "@/components/admin/metrics/SummaryWidget";
import { CountriesWidget } from "@/components/admin/metrics/CountriesWidget";
import { DevicesOsWidget } from "@/components/admin/metrics/DevicesOsWidget";
import { BrowsersBrandingWidget } from "@/components/admin/metrics/BrowsersBrandingWidget";

export default function MetricsPage() {
  const { data, isLoading } = useApi('/admin/metrics');

  const rawMetrics = data?.data;

  // Map strings to icons
  const iconMap: Record<string, any> = {
    Globe, Smartphone, Compass, Monitor, Terminal, Activity
  };

  const metrics = rawMetrics ? {
    ...rawMetrics,
    browsers: rawMetrics.browsers?.map((b: any) => ({ ...b, icon: iconMap[b.icon] || Globe })) || [],
    os: rawMetrics.os?.map((o: any) => ({ ...o, icon: iconMap[o.icon] || Monitor })) || [],
  } : null;

  if (isLoading || !metrics) {
    return <div className="p-6 text-white text-center">Cargando mtricas...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            GEMFLIX ANALYTICS
          </h1>
          <p className="text-gray-400 mt-1 uppercase tracking-wider text-xs font-semibold">
            Resumen de actividad de plataforma ⬢ altimas 24 horas
          </p>
        </div>
      </div>

      <SummaryWidget 
        total_visits={metrics.total_visits} 
        devices={metrics.devices} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CountriesWidget countries={metrics.countries} />
        <DevicesOsWidget devices={metrics.devices} os={metrics.os} />
        <BrowsersBrandingWidget browsers={metrics.browsers} />
      </div>

    </div>
  );
}
