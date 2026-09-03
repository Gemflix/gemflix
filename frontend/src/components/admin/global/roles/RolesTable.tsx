import { Shield, Key, Users } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";
import { motion } from "framer-motion";

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: string[];
}

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  onEdit?: (role: Role) => void;
}

export function RolesTable({ roles, loading, onEdit }: RolesTableProps) {
  
  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Rol',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          <div className={`p-2.5 rounded-xl shadow-lg border ${item.is_system ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
            <Shield size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              <span className="capitalize">{item.name}</span>
              {item.is_system && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">Sistema</span>}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'Permisos Asignados',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-gray-300">
          <Key size={14} className="text-gray-500" />
          <span className="font-medium text-sm">{item.permissions?.length || 0} Permisos</span>
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={roles}
        columns={columns}
        loading={loading}
        emptyIcon={Users}
        emptyMessage="No hay roles creados. Crea uno para asignar permisos a tu Staff."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-blue-400 font-medium px-4 py-2 bg-white/5 hover:bg-blue-500/10 rounded-xl transition-all text-sm border border-white/5 hover:border-blue-500/30 shadow-sm"
          >
            Editar Permisos
          </button>
        )}
      />
    </motion.div>
  );
}
