import { Tv, Eye, EyeOff } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Serie {
  id: number;
  tmdb_id: number;
  title: string;
  original_title?: string;
  first_air_date?: string;
  poster_path?: string;
  vote_average?: number;
  seasons_count: number;
  status: string; // 'published', 'draft', 'processing'
  is_visible: boolean;
}

interface SeriesTableProps {
  series: Serie[];
  loading: boolean;
  onEdit?: (serie: Serie) => void;
}

export function SeriesTable({ series, loading, onEdit }: SeriesTableProps) {
  
  const columns: Column<Serie>[] = [
    {
      key: 'title',
      label: 'Serie',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 bg-surface-dark rounded-md border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
            {item.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Tv size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="text-white font-bold max-w-50 truncate" title={item.title}>
              {item.title}
            </div>
            {item.original_title && item.original_title !== item.title && (
              <div className="text-xs text-gray-400 max-w-50 truncate">
                {item.original_title}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'first_air_date',
      label: 'Estreno',
      render: (item) => (
        <div className="text-sm text-gray-300">
          {item.first_air_date ? new Date(item.first_air_date).getFullYear() : ''}
        </div>
      )
    },
    {
      key: 'seasons_count',
      label: 'Temporadas',
      render: (item) => (
        <span className="bg-surface-dark px-2 py-1 text-xs border border-white/10 rounded">
          {item.seasons_count || 0}
        </span>
      )
    },
    {
      key: 'vote_average',
      label: 'Calificación',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-500 text-sm">&</span>
          <span className="text-sm font-medium">{item.vote_average ? item.vote_average.toFixed(1) : '0.0'}</span>
        </div>
      )
    },
    {
      key: 'is_visible',
      label: 'Visibilidad',
      render: (item) => (
        item.is_visible ? (
          <span className="text-emerald-400 flex items-center gap-1.5 text-xs"><Eye size={14} /> Visible</span>
        ) : (
          <span className="text-gray-500 flex items-center gap-1.5 text-xs"><EyeOff size={14} /> Oculto</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          item.status === 'published' ? 'bg-accent/10 text-accent' :
          item.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
          'bg-white/5 text-gray-400'
        }`}>
          {item.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={series}
      columns={columns}
      loading={loading}
      emptyIcon={Tv}
      emptyMessage="No hay series registradas. Haz clic en 'Nueva Serie' e ingresa el ID de TMDB."
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
