import { PlaySquare, Video } from "lucide-react";
import { DataTable, Column } from "../../ui/DataTable";
import { motion } from "framer-motion";

export interface Tutorial {
  id: number;
  title: string;
  description: string;
  video_url: string;
  is_active: boolean;
  created_at?: string;
}

interface TutorialsTableProps {
  tutorials: Tutorial[];
  loading: boolean;
  onEdit?: (tutorial: Tutorial) => void;
}

export function TutorialsTable({ tutorials, loading, onEdit }: TutorialsTableProps) {
  
  const columns: Column<Tutorial>[] = [
    {
      key: 'title',
      label: 'Tutorial',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-20 h-12 shrink-0 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center relative shadow-lg overflow-hidden group">
            {item.video_url ? (
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors flex items-center justify-center">
                <PlaySquare size={20} className="text-blue-400 opacity-80" />
              </div>
            ) : (
              <Video size={20} className="text-gray-500" />
            )}
          </div>
          
          <div>
            <div className="font-bold text-white text-base tracking-wide">
              {item.title}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 max-w-72 truncate">{item.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 w-max ${
          item.is_active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.is_active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
          {item.is_active ? 'PÚBLICO' : 'OCULTO'}
        </span>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={tutorials}
        columns={columns}
        loading={loading}
        emptyIcon={PlaySquare}
        emptyMessage="No hay tutoriales creados. Añade videos para enseñar a usar la app."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-blue-400 font-medium px-4 py-2 bg-white/5 hover:bg-blue-500/10 rounded-xl transition-all text-sm border border-white/5 hover:border-blue-500/30 shadow-sm"
          >
            Editar
          </button>
        )}
      />
    </motion.div>
  );
}
