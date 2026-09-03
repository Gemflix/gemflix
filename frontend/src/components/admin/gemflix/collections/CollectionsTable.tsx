import { Library, Eye, EyeOff } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Collection {
  id: number;
  tmdb_id: number;
  name: string;
  poster_path?: string;
  movies_count: number;
  is_visible: boolean;
}

interface CollectionsTableProps {
  collections: Collection[];
  loading: boolean;
  onEdit?: (collection: Collection) => void;
}

export function CollectionsTable({ collections, loading, onEdit }: CollectionsTableProps) {
  
  const columns: Column<Collection>[] = [
    {
      key: 'name',
      label: 'Colección',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 bg-surface-dark rounded-md border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
            {item.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Library size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="text-white font-bold max-w-50 truncate" title={item.name}>
              {item.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              TMDB: {item.tmdb_id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'movies_count',
      label: 'Películas',
      render: (item) => (
        <span className="bg-surface-dark px-2.5 py-1 text-xs border border-white/10 rounded font-medium">
          {item.movies_count} películas
        </span>
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
    }
  ];

  return (
    <DataTable
      data={collections}
      columns={columns}
      loading={loading}
      emptyIcon={Library}
      emptyMessage="No hay colecciones registradas. Agrega el ID de una colección de TMDB."
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
