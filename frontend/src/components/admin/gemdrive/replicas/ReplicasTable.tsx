import { HardDrive, Server, AlertCircle } from "lucide-react";

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
}

export function ReplicasTable({ replicas, loading }: ReplicasTableProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando réplicas...</div>;
  }

  if (replicas.length === 0) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center">
        <Server size={48} className="text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay réplicas configuradas</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Las réplicas son unidades compartidas donde el sistema clona los videos temporalmente para evitar límites de descarga en las fuentes.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/40 text-xs uppercase text-gray-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre / Prioridad</th>
              <th className="px-6 py-4 font-medium">Shared Drive ID</th>
              <th className="px-6 py-4 font-medium">Cuenta Asignada</th>
              <th className="px-6 py-4 font-medium">Límite</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {replicas.map((replica) => (
              <tr key={replica.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 text-accent rounded-lg">
                      <Server size={18} />
                    </div>
                    <div>
                      <div className="text-white font-medium">{replica.name}</div>
                      <div className="text-xs text-gray-500">Prioridad: {replica.priority}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-mono text-xs text-gray-400 bg-black/30 p-1.5 rounded border border-white/5 inline-block">
                    {replica.shared_drive_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{replica.service_account_email || "Ninguna"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{replica.space_limit_gib} GB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    replica.health_status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    replica.health_status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {replica.health_status === 'healthy' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {replica.health_status.toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
