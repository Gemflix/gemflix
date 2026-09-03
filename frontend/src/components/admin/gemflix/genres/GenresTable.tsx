import { Tags } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Genre {
  id: number;
  tmdb_id: number;
  name: string;
  slug: string;
  movies_count: number;
  series_count: number;
}

interface GenresTableProps {
  genres: Genre[];
  loading: boolean;
  onEdit?: (genre: Genre) => void;
}

export function GenresTable({ genres, loading, onEdit }: GenresTableProps) {
  
  const columns: Column<Genre>[] = [
    {
      key: 'name',
      label: 'Género',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-base">{item.name}</div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">{item.slug}</div>
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
      key: 'content_count',
      label: 'Contenido Asociado',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-white font-medium">{item.movies_count}</span> <span className="text-gray-400">películas</span>
          </div>
          <div className="text-sm">
            <span className="text-white font-medium">{item.series_count}</span> <span className="text-gray-400">series</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={genres}
      columns={columns}
      loading={loading}
      emptyIcon={Tags}
      emptyMessage="No hay géneros registrados. Añádelos con su ID de TMDB."
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
