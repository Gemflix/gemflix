import { Folder } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface DriveSource {
  id: number;
  service_account_id: number;
  name: string;
  folder_id: string;
  provider: string;
  sync_interval_minutes: number;
  created_at: string;
}

interface SourcesTableProps {
  sources: DriveSource[];
  loading: boolean;
  onEdit?: (source: DriveSource) => void;
}

export function SourcesTable({ sources, loading, onEdit }: SourcesTableProps) {
  
  const columns: Column<DriveSource>[] = [
    {
      key: 'name',
      label: 'Nombre de la Fuente',
      render: (item) => <span className="font-bold text-white">{item.name}</span>
    },
    {
      key: 'folder_id',
      label: 'Folder ID',
      render: (item) => <span className="font-mono text-xs">{item.folder_id}</span>
    },
    {
      key: 'provider',
      label: 'Proveedor'
    },
    {
      key: 'sync_interval_minutes',
      label: 'Intervalo Sync',
      render: (item) => <span>{item.sync_interval_minutes} min</span>
    }
  ];

  return (
    <DataTable
      data={sources}
      columns={columns}
      loading={loading}
      emptyIcon={Folder}
      emptyMessage="No hay fuentes registradas. Registra un Shared Drive o Carpeta para comenzar a escanear películas."
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
