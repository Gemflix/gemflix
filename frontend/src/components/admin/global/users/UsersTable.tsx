import { User, ShieldAlert, Crown, Ban, CheckCircle2 } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface GemflixUser {
  id: number;
  email: string;
  username?: string;
  avatar_url?: string;
  is_premium: boolean;
  status: string; // 'active', 'banned', 'suspended'
  country_code?: string;
  created_at: string;
}

interface UsersTableProps {
  users: GemflixUser[];
  loading: boolean;
  onEdit?: (user: GemflixUser) => void;
}

export function UsersTable({ users, loading, onEdit }: UsersTableProps) {
  
  const columns: Column<GemflixUser>[] = [
    {
      key: 'email',
      label: 'Usuario',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            {item.avatar_url ? (
              <img src={item.avatar_url} alt={item.email} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-white">{item.username || 'Sin Username'}</div>
            <div className="text-xs text-gray-400">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'is_premium',
      label: 'Membresía',
      render: (item) => (
        item.is_premium ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Crown size={12} /> VIP
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
            Estándar
          </span>
        )
      )
    },
    {
      key: 'country_code',
      label: 'País',
      render: (item) => (
        <span className="text-sm">{item.country_code || 'Desconocido'}</span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {item.status === 'active' ? <CheckCircle2 size={12} /> : <Ban size={12} />}
          {item.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha de Registro',
      render: (item) => (
        <div className="text-sm text-gray-400">
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      emptyIcon={ShieldAlert}
      emptyMessage="No hay usuarios registrados aún."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Administrar
        </button>
      )}
    />
  );
}
