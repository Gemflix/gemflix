import { Server, Activity, Database, HardDrive } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface VideoServer {
  id: number;
  name: string;
  type: 'streaming' | 'storage' | 'transcoder';
  url: string;
  capacity_tb: number;
  used_tb: number;
  status: 'active' | 'maintenance' | 'offline';
  load_percent: number;
}

interface ServersTableProps {
  servers: VideoServer[];
  loading: boolean;
  onEdit?: (server: VideoServer) => void;
}

export function ServersTable({ servers, loading, onEdit }: ServersTableProps) {
  
  const getServerIcon = (type: string) => {
    switch (type) {
      case 'streaming': return <Activity size={18} className="text-emerald-400" />;
      case 'storage': return <Database size={18} className="text-blue-400" />;
      case 'transcoder': return <HardDrive size={18} className="text-purple-400" />;
      default: return <Server size={18} className="text-gray-400" />;
    }
  };

  const columns: Column<VideoServer>[] = [
    {
      key: 'name',
      label: 'Servidor',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/20 rounded-lg border border-white/5">
            {getServerIcon(item.type)}
          </div>
          <div>
            <div className="text-white font-medium max-w-xs">{item.name}</div>
            <div className="text-xs text-gray-500 uppercase">{item.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'url',
      label: 'Dirección URL / IP',
      render: (item) => (
        <span className="text-xs font-mono text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">
          {item.url}
        </span>
      )
    },
    {
      key: 'storage',
      label: 'Almacenamiento',
      render: (item) => (
        <div className="w-full min-w-40 max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{item.used_tb} TB Usado</span>
            <span className="text-gray-500">{item.capacity_tb} TB Total</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full bg-blue-500`}
              style={{ width: `${(item.used_tb / item.capacity_tb) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'load_percent',
      label: 'Carga CPU',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
            item.load_percent > 80 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
            item.load_percent > 50 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {item.load_percent}%
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span className={`text-xs px-2 py-1 rounded-full border ${
          item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          item.status === 'maintenance' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
          'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {item.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={servers}
      columns={columns}
      loading={loading}
      emptyIcon={Server}
      emptyMessage="No hay servidores configurados."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Editar
        </button>
      )}
    />
  );
}
