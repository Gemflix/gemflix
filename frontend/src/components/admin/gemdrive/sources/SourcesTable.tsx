import { Folder } from "lucide-react";

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
}

export function SourcesTable({ sources, loading }: SourcesTableProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando fuentes...</div>;
  }

  if (sources.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <Folder size={48} className="mx-auto mb-4 opacity-50 text-blue-400" />
        <p>No hay fuentes registradas.</p>
        <p className="text-sm mt-2">Registra un Shared Drive o Carpeta para comenzar a escanear películas.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm text-gray-300">
      <thead className="bg-surface-dark text-gray-400 uppercase text-xs">
        <tr>
          <th className="px-6 py-4 font-semibold">Nombre de la Fuente</th>
          <th className="px-6 py-4 font-semibold">Folder ID</th>
          <th className="px-6 py-4 font-semibold">Proveedor</th>
          <th className="px-6 py-4 font-semibold">Intervalo Sync</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-border">
        {sources.map(src => (
          <tr key={src.id} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-bold text-white">{src.name}</td>
            <td className="px-6 py-4 font-mono text-xs">{src.folder_id}</td>
            <td className="px-6 py-4">{src.provider}</td>
            <td className="px-6 py-4">{src.sync_interval_minutes} min</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
