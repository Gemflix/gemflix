"use client";

import { useApi } from "@/hooks/useApi";
import { SyncTable, SyncJob } from "@/components/admin/gemdrive/monitor/SyncTable";

export default function MonitorPage() {
  const { data, isLoading } = useApi('/admin/gemdrive/monitor');
  
  // Mock data for Sync Jobs
  const jobs: SyncJob[] = data?.data || [
    { id: 1, file_name: 'The.Boys.S04E01.mkv', source_replica: 'Drive Primario', target_replica: 'SharePoint Media A', progress_percent: 45, status: 'syncing', started_at: new Date().toISOString() },
    { id: 2, file_name: 'Deadpool.and.Wolverine.mp4', source_replica: 'Drive Primario', target_replica: 'OneDrive Backup', progress_percent: 100, status: 'completed', started_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, file_name: 'Oppenheimer.4K.mp4', source_replica: 'SharePoint Media A', target_replica: 'Drive GSuite 1', progress_percent: 12, status: 'failed', started_at: new Date(Date.now() - 7200000).toISOString() }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitor de Sincronización</h1>
          <p className="text-gray-400 mt-1">
            Supervisa en tiempo real el progreso de clonado de archivos entre diferentes nodos en la nube.
          </p>
        </div>
      </div>

      <SyncTable 
        jobs={jobs} 
        loading={isLoading} 
      />
    </div>
  );
}
