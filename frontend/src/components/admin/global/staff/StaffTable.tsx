import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface StaffMember {
  id: number;
  email: string;
  name: string;
  role: string; // 'superadmin', 'admin', 'moderator'
  last_login?: string;
}

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  onEdit?: (member: StaffMember) => void;
}

export function StaffTable({ staff, loading, onEdit }: StaffTableProps) {
  
  const columns: Column<StaffMember>[] = [
    {
      key: 'name',
      label: 'Personal',
      render: (item) => (
        <div>
          <div className="font-bold text-white">{item.name}</div>
          <div className="text-xs text-gray-400">{item.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Nivel de Acceso (Rol)',
      render: (item) => {
        if (item.role === 'superadmin') {
          return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"><ShieldAlert size={12} /> Super Admin</span>;
        }
        if (item.role === 'admin') {
          return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><ShieldCheck size={12} /> Administrador</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Shield size={12} /> Moderador</span>;
      }
    },
    {
      key: 'last_login',
      label: 'altima Conexión',
      render: (item) => (
        <span className="text-sm text-gray-400">
          {item.last_login ? new Date(item.last_login).toLocaleString() : 'Nunca'}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={staff}
      columns={columns}
      loading={loading}
      emptyIcon={ShieldAlert}
      emptyMessage="No hay miembros del staff. Añade administradores para que te ayuden a gestionar el sistema."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Editar Rol
        </button>
      )}
    />
  );
}
