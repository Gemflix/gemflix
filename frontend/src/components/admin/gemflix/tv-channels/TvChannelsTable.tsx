import { MonitorPlay, Eye, EyeOff } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface TvChannel {
  id: number;
  name: string;
  category: string;
  logo_url?: string;
  stream_url: string;
  is_visible: boolean;
  order_index: number;
}

interface TvChannelsTableProps {
  channels: TvChannel[];
  loading: boolean;
  onEdit?: (channel: TvChannel) => void;
}

export function TvChannelsTable({ channels, loading, onEdit }: TvChannelsTableProps) {
  
  const columns: Column<TvChannel>[] = [
    {
      key: 'name',
      label: 'Canal de TV',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 bg-surface-dark rounded-md border border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-2">
            {item.logo_url ? (
              <img 
                src={item.logo_url} 
                alt={item.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <MonitorPlay size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="text-white font-bold max-w-50 truncate" title={item.name}>
              {item.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{item.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'stream_url',
      label: 'Stream URL (M3U8)',
      render: (item) => (
        <div className="text-xs font-mono text-gray-400 bg-black/30 p-1.5 rounded border border-white/5 max-w-xs truncate" title={item.stream_url}>
          {item.stream_url}
        </div>
      )
    },
    {
      key: 'order_index',
      label: 'Orden',
      render: (item) => (
        <span className="bg-surface-dark px-2 py-1 text-xs border border-white/10 rounded font-mono">
          #{item.order_index}
        </span>
      )
    },
    {
      key: 'is_visible',
      label: 'Estado',
      render: (item) => (
        item.is_visible ? (
          <span className="text-emerald-400 flex items-center gap-1.5 text-xs"><Eye size={14} /> Visible</span>
        ) : (
          <span className="text-gray-500 flex items-center gap-1.5 text-xs"><EyeOff size={14} /> Oculto</span>
        )
      )
    }
  ];

  return (
    <DataTable
      data={channels}
      columns={columns}
      loading={loading}
      emptyIcon={MonitorPlay}
      emptyMessage="No hay canales de IPTV configurados."
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
