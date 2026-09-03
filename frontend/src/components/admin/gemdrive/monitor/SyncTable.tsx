import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface SyncJob {
  id: number;
  file_name: string;
  source_replica: string;
  target_replica: string;
  progress_percent: number;
  status: string; // 'syncing', 'completed', 'failed', 'queued'
  started_at: string;
}

interface SyncTableProps {
  jobs: SyncJob[];
  loading: boolean;
}

export function SyncTable({ jobs, loading }: SyncTableProps) {
  
  const columns: Column<SyncJob>[] = [
    {
      key: 'file_name',
      label: 'Archivo en Sincronización',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
            <RefreshCw size={18} className={item.status === 'syncing' ? 'animate-spin' : ''} />
          </div>
          <div className="font-bold text-white text-sm max-w-xs md:max-w-xs truncate" title={item.file_name}>
            {item.file_name}
          </div>
        </div>
      )
    },
    {
      key: 'route',
      label: 'Ruta de Clonado',
      render: (item) => (
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span className="bg-surface-dark px-1.5 py-0.5 rounded border border-white/5">{item.source_replica}</span>
          <span>&rarr;</span>
          <span className="bg-surface-dark px-1.5 py-0.5 rounded border border-white/5">{item.target_replica}</span>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progreso',
      render: (item) => (
        <div className="w-full min-w-40 max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className={item.status === 'failed' ? 'text-red-400' : 'text-emerald-400'}>
              {item.status.toUpperCase()}
            </span>
            <span className="text-gray-400">{item.progress_percent}%</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                item.status === 'failed' ? 'bg-red-500' : 
                item.status === 'completed' ? 'bg-emerald-500' : 'bg-accent'
              }`}
              style={{ width: `${item.progress_percent}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'started_at',
      label: 'Iniciado',
      render: (item) => (
        <span className="text-xs text-gray-500 flex items-center gap-1.5">
          <Clock size={12} />
          {new Date(item.started_at).toLocaleTimeString()}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={jobs}
      columns={columns}
      loading={loading}
      emptyIcon={RefreshCw}
      emptyMessage="No hay trabajos de sincronización activos o recientes."
    />
  );
}
