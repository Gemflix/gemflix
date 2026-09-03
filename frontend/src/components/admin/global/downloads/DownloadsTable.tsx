import { Download, Clock, CheckCircle2, XCircle } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";
import { motion } from "framer-motion";

export interface DownloadLog {
  id: number;
  user_email: string;
  item_title: string;
  item_type: string; // 'movie', 'episode'
  status: 'downloading' | 'completed' | 'expired';
  downloaded_bytes: number;
  total_bytes: number;
  expires_at: string;
  created_at: string;
}

interface DownloadsTableProps {
  downloads: DownloadLog[];
  loading: boolean;
}

export function DownloadsTable({ downloads, loading }: DownloadsTableProps) {
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { icon: <CheckCircle2 size={14} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'COMPLETADO' };
      case 'downloading': return { icon: <Download size={14} className="animate-bounce" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'DESCARGANDO' };
      case 'expired': return { icon: <XCircle size={14} />, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'EXPIRADO' };
      default: return { icon: <Clock size={14} />, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', label: status.toUpperCase() };
    }
  };

  const columns: Column<DownloadLog>[] = [
    {
      key: 'user',
      label: 'Usuario',
      render: (item) => (
        <div className="font-medium text-white text-sm">
          {item.user_email}
        </div>
      )
    },
    {
      key: 'item',
      label: 'Contenido Descargado',
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="font-bold text-white text-sm">{item.item_title}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">{item.item_type}</div>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Tamaño',
      render: (item) => (
        <div className="text-sm font-mono text-gray-300">
          {formatBytes(item.total_bytes)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => {
        const config = getStatusConfig(item.status);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5 w-max border ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'expires',
      label: 'Expira',
      render: (item) => (
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <Clock size={12} />
          {new Date(item.expires_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={downloads}
        columns={columns}
        loading={loading}
        emptyIcon={Download}
        emptyMessage="No hay registros de descargas offline recientes."
      />
    </motion.div>
  );
}
