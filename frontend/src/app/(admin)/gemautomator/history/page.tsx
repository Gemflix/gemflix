"use client";

import { useApi } from "@/hooks/useApi";
import { HistoryTable, LogEntry } from "@/components/admin/gemautomator/history/HistoryTable";

export default function HistoryPage() {
  const { data, isLoading } = useApi('/admin/history');
  
  // Datos mockeados
  const logs: LogEntry[] = data?.data || [
    { id: 1, level: 'error', source: 'Subtitles Downloader', message: 'API rate limit exceeded. Retrying in 15m.', created_at: new Date().toISOString() },
    { id: 2, level: 'info', source: 'TMDB Auto-Updater', message: 'Successfully updated 45 movies.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, level: 'warning', source: 'Drive File Scanner', message: 'File ID 1xxB... not found or permission denied.', created_at: new Date(Date.now() - 7200000).toISOString() }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial y Logs</h1>
          <p className="text-gray-400 mt-1">
            Audita los eventos del sistema, errores de automatización y actividad de los motores en tiempo real.
          </p>
        </div>
      </div>

      <HistoryTable 
        logs={logs} 
        loading={isLoading} 
      />
    </div>
  );
}
