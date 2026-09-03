import { Server, AlertCircle } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface ReplicaTarget {
  id: number;
  service_account_id: number;
  service_account_email: string;
  name: string;
  shared_drive_id: string;
  streaming_folder_id: string;
  gemdrive_folder_id: string;
  recovery_folder_id: string;
  space_limit_gib: number;
  priority: number;
  health_status: string;
  created_at: string;
}

interface ReplicasTableProps {
  replicas: ReplicaTarget[];
  loading: boolean;
  onEdit?: (replica: ReplicaTarget) => void;
}

export function ReplicasTable({ replicas, loading, onEdit }: ReplicasTableProps) {
  
  const columns: Column<ReplicaTarget>[] = [
    {
      key: 'name',
      label: 'Nombre / Prioridad',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg">
            <Server size={18} />
          </div>
          <div>
            <div className="text-white font-medium">{item.name}</div>
            <div className="text-xs text-gray-500">Prioridad: {item.priority}</div>
          </div>
        </div>
      )
    },
    {
      key: 'shared_drive_id',
      label: 'Shared Drive ID',
      render: (item) => (
        <div className="font-mono text-xs text-gray-400 bg-black/30 p-1.5 rounded border border-white/5 inline-block">
          {item.shared_drive_id}
        </div>
      )
    },
    {
      key: 'service_account_email',
      label: 'Cuenta Asignada',
      render: (item) => (
        <div className="text-sm">{item.service_account_email || "Ninguna"}</div>
      )
    },
    {
      key: 'space_limit_gib',
      label: 'Límite',
      render: (item) => (
        <div className="text-sm">{item.space_limit_gib} GB</div>
      )
    },
    {
      key: 'health_status',
      label: 'Estado',
      render: (item) => (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          item.health_status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          item.health_status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {item.health_status === 'healthy' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          ) : (
            <AlertCircle size={12} />
          )}
          {item.health_status.toUpperCase()}
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={replicas}
      columns={columns}
      loading={loading}
      emptyIcon={Server}
      emptyMessage="No hay réplicas configuradas. Las réplicas clonan los videos temporalmente."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors"
        >
          Editar
        </button>
      )}
    />
  );
}
