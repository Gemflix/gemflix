import { Megaphone, Link as LinkIcon, DollarSign, LayoutTemplate, Box, CreditCard } from "lucide-react";
import { DataTable, Column } from "../../../ui/DataTable";
import { motion } from "framer-motion";

export interface AdCampaign {
  id: number;
  company: string;
  type: string;
  content: string;
  is_rewarded: boolean;
  reward_tokens: number;
  daily_limit: number;
  is_active: boolean;
  priority: number;
  created_at?: string;
}

interface AdsTableProps {
  ads: AdCampaign[];
  loading: boolean;
  onEdit?: (ad: AdCampaign) => void;
}

export function AdsTable({ ads, loading, onEdit }: AdsTableProps) {
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'smartlink': return <LinkIcon size={18} />;
      case 'shortener': return <LinkIcon size={18} />;
      case 'banner': return <LayoutTemplate size={18} />;
      case 'interstitial': return <Box size={18} />;
      case 'vast': return <Megaphone size={18} />;
      default: return <LayoutTemplate size={18} />;
    }
  };

  const columns: Column<AdCampaign>[] = [
    {
      key: 'company',
      label: 'Campaña / Empresa',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl shadow-lg border border-blue-500/20">
            {getTypeIcon(item.type)}
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              {item.company || 'Sin Nombre'}
              {item.is_rewarded && (
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                  <DollarSign size={10} /> Recompensa
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 max-w-50 truncate uppercase tracking-wider">{item.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Prioridad (Waterfall)',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(100, Math.max(5, item.priority))}%` }} />
          </div>
          <span className="text-white font-mono text-sm font-medium">{item.priority}</span>
        </div>
      )
    },
    {
      key: 'daily_limit',
      label: 'Límite Diario',
      render: (item) => (
        <div className="text-gray-300 text-sm">
          {item.daily_limit === 0 ? (
            <span className="text-gray-500 italic">Ilimitado</span>
          ) : (
            <span className="font-medium text-white bg-white/5 px-2 py-1 rounded-md border border-white/10">{item.daily_limit} vistas/día</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 w-max ${
          item.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.is_active && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
          {item.is_active ? 'ACTIVO' : 'PAUSADO'}
        </span>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={ads}
        columns={columns}
        loading={loading}
        emptyIcon={Megaphone}
        emptyMessage="No has configurado ningún anuncio ni acortador."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-blue-400 font-medium px-4 py-2 bg-white/5 hover:bg-blue-500/10 rounded-xl transition-all text-sm border border-white/5 hover:border-blue-500/30 shadow-sm"
          >
            Editar Anuncio
          </button>
        )}
      />
    </motion.div>
  );
}
