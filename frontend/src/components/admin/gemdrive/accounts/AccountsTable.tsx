import { Shield, ShieldAlert } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface ServiceAccount {
  id: number;
  name: string;
  email: string;
  provider: string;
  quota_limit_bytes: number;
  quota_used_bytes: number;
  is_active: boolean;
  status: string;
  created_at: string;
}

interface AccountsTableProps {
  accounts: ServiceAccount[];
  loading: boolean;
  onEdit?: (account: ServiceAccount) => void;
}

export function AccountsTable({ accounts, loading, onEdit }: AccountsTableProps) {
  
  const columns: Column<ServiceAccount>[] = [
    {
      key: 'name',
      label: 'Nombre / Email',
      render: (item) => (
        <div>
          <div className="font-bold text-white">{item.name}</div>
          <div className="text-xs text-gray-400">{item.email}</div>
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Proveedor',
      render: (item) => (
        <span className="bg-surface-dark px-2 py-1 rounded-md text-xs border border-white/10">
          {item.provider}
        </span>
      )
    },
    {
      key: 'quota',
      label: 'Cuota Usada',
      render: (item) => {
        const usedGb = Math.round((item.quota_used_bytes || 0) / (1024*1024*1024));
        const limitGb = Math.round((item.quota_limit_bytes || 0) / (1024*1024*1024));
        const percentage = Math.min(100, ((item.quota_used_bytes || 0) / (item.quota_limit_bytes || 1)) * 100);
        return (
          <div>
            <div className="text-sm">{usedGb} GiB / {limitGb} GiB</div>
            <div className="w-full bg-surface-dark h-1.5 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-accent h-full rounded-full transition-all" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        item.is_active ? (
          <span className="text-emerald-400 flex items-center gap-1"><Shield size={14} /> Activo</span>
        ) : (
          <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={14} /> Inactivo</span>
        )
      )
    }
  ];

  return (
    <DataTable
      data={accounts}
      columns={columns}
      loading={loading}
      emptyIcon={ShieldAlert}
      emptyMessage="No hay cuentas de servicio registradas. Registra una identidad para comenzar a sincronizar Google Drive."
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
