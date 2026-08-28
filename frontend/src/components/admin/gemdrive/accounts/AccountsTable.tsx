import { Shield, ShieldAlert } from "lucide-react";

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
}

export function AccountsTable({ accounts, loading }: AccountsTableProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando cuentas...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
        <p>No hay cuentas de servicio registradas.</p>
        <p className="text-sm mt-2">Registra una identidad para comenzar a sincronizar Google Drive.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm text-gray-300">
      <thead className="bg-surface-dark text-gray-400 uppercase text-xs">
        <tr>
          <th className="px-6 py-4 font-semibold">Nombre / Email</th>
          <th className="px-6 py-4 font-semibold">Proveedor</th>
          <th className="px-6 py-4 font-semibold">Cuota Usada</th>
          <th className="px-6 py-4 font-semibold">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-border">
        {accounts.map(acc => (
          <tr key={acc.id} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="font-bold text-white">{acc.name}</div>
              <div className="text-xs text-gray-400">{acc.email}</div>
            </td>
            <td className="px-6 py-4">
              <span className="bg-surface-dark px-2 py-1 rounded-md text-xs border border-white/10">
                {acc.provider}
              </span>
            </td>
            <td className="px-6 py-4">
              {Math.round((acc.quota_used_bytes || 0) / (1024*1024*1024))} GiB / {Math.round((acc.quota_limit_bytes || 0) / (1024*1024*1024))} GiB
              <div className="w-full bg-surface-dark h-1.5 mt-1 rounded-full overflow-hidden">
                <div 
                  className="bg-accent h-full rounded-full" 
                  style={{ width: `${Math.min(100, ((acc.quota_used_bytes || 0) / (acc.quota_limit_bytes || 1)) * 100)}%` }}
                ></div>
              </div>
            </td>
            <td className="px-6 py-4">
              {acc.is_active ? (
                <span className="text-emerald-400 flex items-center gap-1"><Shield size={14} /> Activo</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={14} /> Inactivo</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
