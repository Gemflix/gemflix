import { LayoutGrid, Eye, EyeOff } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoriesTable({ categories, loading, onEdit }: CategoriesTableProps) {
  
  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Categoría (Carrusel)',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-base flex items-center gap-2">
            <LayoutGrid size={16} className="text-accent" />
            {item.name}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">{item.slug}</div>
        </div>
      )
    },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      loading={loading}
      emptyIcon={LayoutGrid}
      emptyMessage="No hay categorías personalizadas. (Ej: 'Tendencias', 'Recién Añadidas')."
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
