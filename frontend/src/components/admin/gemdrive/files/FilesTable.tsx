import { FileVideo, Search, Link } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface GemFile {
  id: number;
  filename: string;
  tmdb_id: number;
  mime_type: string;
  size_mb: number;
  replicas_count: number;
  status: string; // 'ready', 'processing', 'missing'
}

interface FilesTableProps {
  files: GemFile[];
  loading: boolean;
  onEdit?: (file: GemFile) => void;
}

export function FilesTable({ files, loading, onEdit }: FilesTableProps) {
  
  const columns: Column<GemFile>[] = [
    {
      key: 'filename',
      label: 'Archivo Mapeado',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <FileVideo size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-sm max-w-sm truncate" title={item.filename}>{item.filename}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
              <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5">ID: {item.id}</span>
              <span>TMDB: {item.tmdb_id}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'size_mb',
      label: 'Tamaño',
      render: (item) => (
        <span className="text-sm font-medium text-gray-300">
          {(item.size_mb / 1024).toFixed(2)} GB
        </span>
      )
    },
    {
      key: 'replicas_count',
      label: 'Nodos (Réplicas)',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-dark border border-white/10 text-xs">
          <Link size={12} className="text-accent" /> {item.replicas_count} réplicas
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => {
        if (item.status === 'processing') {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">CLONANDO</span>;
        }
        if (item.status === 'missing') {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">CAÍDO</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">LISTO</span>;
      }
    }
  ];

  return (
    <DataTable
      data={files}
      columns={columns}
      loading={loading}
      emptyIcon={FileVideo}
      emptyMessage="No hay archivos indexados aún."
      actions={(item) => (
        <button 
          onClick={() => onEdit?.(item)}
          className="text-accent hover:text-accent-light px-3 py-1 bg-accent/10 rounded-lg transition-colors text-sm"
        >
          Gestionar Enlaces
        </button>
      )}
    />
  );
}
