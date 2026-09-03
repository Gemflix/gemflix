import { RadioReceiver } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Network {
  id: number;
  tmdb_id: number;
  name: string;
  slug: string;
  logo_path?: string;
  series_count: number;
}

interface NetworksTableProps {
  networks: Network[];
  loading: boolean;
  onEdit?: (network: Network) => void;
}

export function NetworksTable({ networks, loading, onEdit }: NetworksTableProps) {
  
  const columns: Column<Network>[] = [
    {
      key: 'name',
      label: 'Productora / Red',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 bg-white rounded-md border border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-2">
            {item.logo_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.logo_path}`} 
                alt={item.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <RadioReceiver size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="text-white font-bold max-w-50 truncate" title={item.name}>
              {item.name}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">{item.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'tmdb_id',
      label: 'TMDB ID',
      render: (item) => (
        <span className="font-mono text-xs text-gray-400 bg-black/30 p-1.5 rounded border border-white/5">
          {item.tmdb_id}
        </span>
      )
    },
    {
      key: 'series_count',
      label: 'Series Asociadas',
      render: (item) => (
        <span className="bg-surface-dark px-2.5 py-1 text-xs border border-white/10 rounded font-medium">
          {item.series_count} series
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={networks}
      columns={columns}
      loading={loading}
      emptyIcon={RadioReceiver}
      emptyMessage="No hay productoras o redes registradas. (Ej: Netflix, HBO)."
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
