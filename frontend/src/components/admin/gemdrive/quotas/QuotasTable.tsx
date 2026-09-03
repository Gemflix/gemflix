import { HardDrive, AlertTriangle } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface Quota {
  id: number;
  replica_name: string;
  max_size_gb: number;
  current_size_gb: number;
  warning_threshold: number; // percentage
  status: string; // 'ok', 'warning', 'full'
}

interface QuotasTableProps {
  quotas: Quota[];
  loading: boolean;
  onEdit?: (quota: Quota) => void;
}

export function QuotasTable({ quotas, loading, onEdit }: QuotasTableProps) {
  
  const columns: Column<Quota>[] = [
    {
      key: 'replica_name',
      label: 'Nodo / Réplica',
      render: (item) => (
        <div className="flex items-center gap-2 font-bold text-white">
          <HardDrive size={16} className="text-gray-400" />
          {item.replica_name}
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Uso de Almacenamiento',
      render: (item) => {
        const percentage = Math.min(100, (item.current_size_gb / item.max_size_gb) * 100);
        return (
          <div className="w-full min-w-50 max-w-sm">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{item.current_size_gb.toFixed(1)} GB</span>
              <span className="text-gray-400">{item.max_size_gb.toFixed(1)} GB</span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full ${
                  percentage >= item.warning_threshold ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => {
        const percentage = (item.current_size_gb / item.max_size_gb) * 100;
        if (percentage >= 98) {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">LLENO</span>;
        }
        if (percentage >= item.warning_threshold) {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold"><AlertTriangle size={12} /> ALERTA</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">OK</span>;
      }
    }
  ];

  return (
    <DataTable
      data={quotas}
      columns={columns}
      loading={loading}
      emptyIcon={HardDrive}
      emptyMessage="No hay límites de cuota configurados."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Editar Límites
        </button>
      )}
    />
  );
}
