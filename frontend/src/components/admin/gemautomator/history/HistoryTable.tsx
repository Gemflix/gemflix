import { History, ShieldAlert, CheckCircle2, AlertTriangle, Bug } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";

export interface LogEntry {
  id: number;
  level: string; // 'info', 'warning', 'error'
  source: string;
  message: string;
  created_at: string;
}

interface HistoryTableProps {
  logs: LogEntry[];
  loading: boolean;
}

export function HistoryTable({ logs, loading }: HistoryTableProps) {
  
  const columns: Column<LogEntry>[] = [
    {
      key: 'level',
      label: 'Nivel',
      render: (item) => {
        if (item.level === 'error') {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs"><Bug size={12} /> ERROR</span>;
        }
        if (item.level === 'warning') {
          return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs"><AlertTriangle size={12} /> WARN</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs"><CheckCircle2 size={12} /> INFO</span>;
      }
    },
    {
      key: 'source',
      label: 'Origen',
      render: (item) => (
        <span className="font-mono text-xs text-gray-400 bg-black/30 p-1.5 rounded border border-white/5">
          {item.source}
        </span>
      )
    },
    {
      key: 'message',
      label: 'Mensaje',
      render: (item) => (
        <span className="text-sm text-gray-300 font-mono">
          {item.message}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha y Hora',
      render: (item) => (
        <span className="text-xs text-gray-500">
          {new Date(item.created_at).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <DataTable
      data={logs}
      columns={columns}
      loading={loading}
      emptyIcon={History}
      emptyMessage="No hay registros en el historial."
    />
  );
}
