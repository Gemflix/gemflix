import { Film, Eye, EyeOff } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string;
  vote_average?: number;
  status: string; // 'published', 'draft', 'processing'
  is_visible: boolean;
}

interface MoviesTableProps {
  movies: Movie[];
  loading: boolean;
  onEdit?: (movie: Movie) => void;
}

export function MoviesTable({ movies, loading, onEdit }: MoviesTableProps) {
  
  const columns: Column<Movie>[] = [
    {
      key: 'title',
      label: 'Película',
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
              <Film size={20} className="text-gray-500" />
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
      key: 'release_date',
      label: 'Año',
      render: (item) => (
        <div className="text-sm text-gray-300">
          {item.release_date ? new Date(item.release_date).getFullYear() : ''}
        </div>
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
      data={movies}
      columns={columns}
      loading={loading}
      emptyIcon={Film}
      emptyMessage="No hay películas registradas. Haz clic en 'Nueva Película' e ingresa el ID de TMDB."
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
