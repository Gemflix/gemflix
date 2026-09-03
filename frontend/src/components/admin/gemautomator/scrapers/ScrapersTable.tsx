import { Bot, Play, Pause, Activity } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Scraper {
  id: number;
  name: string;
  target_url: string;
  status: string; // 'running', 'idle', 'error'
  last_run?: string;
  items_processed: number;
}

interface ScrapersTableProps {
  scrapers: Scraper[];
  loading: boolean;
  onEdit?: (scraper: Scraper) => void;
}

export function ScrapersTable({ scrapers, loading, onEdit }: ScrapersTableProps) {
  
  const columns: Column<Scraper>[] = [
    {
      key: 'name',
      label: 'Scraper / Bot',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{item.name}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-50" title={item.target_url}>
              {item.target_url}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado del Motor',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          item.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' : 
          item.status === 'idle' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
          'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {item.status === 'running' ? <Activity size={12} /> : item.status === 'idle' ? <Pause size={12} /> : <Activity size={12} />}
          {item.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'items_processed',
      label: 'Items Extraídos',
      render: (item) => (
        <span className="text-sm font-medium">{item.items_processed.toLocaleString()} registros</span>
      )
    },
    {
      key: 'last_run',
      label: 'altima Ejecución',
      render: (item) => (
        <span className="text-sm text-gray-400">
          {item.last_run ? new Date(item.last_run).toLocaleString() : 'Nunca'}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={scrapers}
      columns={columns}
      loading={loading}
      emptyIcon={Bot}
      emptyMessage="No hay scrapers configurados. Agrega fuentes de contenido automático."
      actions={(item) => (
        <div className="flex justify-end gap-2">
          {item.status === 'idle' ? (
            <button className="text-emerald-400 hover:text-emerald-300 px-3 py-1 bg-emerald-500/10 rounded-lg transition-colors text-sm flex items-center gap-1">
              <Play size={14} /> Ejecutar
            </button>
          ) : (
            <button className="text-amber-400 hover:text-amber-300 px-3 py-1 bg-amber-500/10 rounded-lg transition-colors text-sm flex items-center gap-1">
              <Pause size={14} /> Detener
            </button>
          )}
          <button 
            onClick={() => onEdit?.(item)}
            className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
          >
            Editar
          </button>
        </div>
      )}
    />
  );
}
