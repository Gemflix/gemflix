import { Tag, Calendar, Percent, Coins, Ticket } from "lucide-react";
import { DataTable, Column } from "../../../ui/DataTable";
import { motion } from "framer-motion";

export interface PromoCode {
  id: number;
  code: string;
  type: string; // 'fixed', 'percentage', 'free_days'
  value: number;
  max_uses: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

interface PromosTableProps {
  promos: PromoCode[];
  loading: boolean;
  onEdit?: (promo: PromoCode) => void;
}

export function PromosTable({ promos, loading, onEdit }: PromosTableProps) {
  
  const getTypeConfig = (type: string, value: number) => {
    switch (type) {
      case 'fixed': return { icon: <Coins size={16} />, color: 'text-amber-400 bg-amber-400/10', label: `${value} Tokens` };
      case 'percentage': return { icon: <Percent size={16} />, color: 'text-blue-400 bg-blue-400/10', label: `${value}% Dcto` };
      case 'free_days': return { icon: <Calendar size={16} />, color: 'text-emerald-400 bg-emerald-400/10', label: `${value} Días VIP` };
      default: return { icon: <Tag size={16} />, color: 'text-gray-400 bg-gray-400/10', label: String(value) };
    }
  };

  const columns: Column<PromoCode>[] = [
    {
      key: 'code',
      label: 'Código Promocional',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl shadow-lg border border-fuchsia-500/20">
            <Ticket size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-widest font-mono">
              {item.code}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {item.max_uses === 0 ? 'Usos Ilimitados' : `${item.used_count} / ${item.max_uses} usados`}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Recompensa',
      render: (item) => {
        const config = getTypeConfig(item.type, item.value);
        return (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-max border ${config.color} border-current/20`}>
            {config.icon}
            <span className="font-bold tracking-wide text-sm">{config.label}</span>
          </div>
        );
      }
    },
    {
      key: 'validity',
      label: 'Vigencia',
      render: (item) => (
        <div className="flex flex-col gap-1 text-xs font-mono text-gray-400">
          <div><span className="text-gray-500">Desde:</span> {item.valid_from ? new Date(item.valid_from).toLocaleDateString() : 'Siempre'}</div>
          <div><span className="text-gray-500">Hasta:</span> {item.valid_until ? new Date(item.valid_until).toLocaleDateString() : 'Sin expiración'}</div>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => {
        const isExpired = item.valid_until && new Date(item.valid_until).getTime() < Date.now();
        const isDepleted = item.max_uses > 0 && item.used_count >= item.max_uses;
        const active = item.is_active && !isExpired && !isDepleted;

        return (
          <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 w-max ${
            active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {active && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            {active ? 'VÁLIDO' : (isExpired ? 'EXPIRADO' : isDepleted ? 'AGOTADO' : 'DESACTIVADO')}
          </span>
        );
      }
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={promos}
        columns={columns}
        loading={loading}
        emptyIcon={Ticket}
        emptyMessage="No has creado ningún código promocional."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-fuchsia-400 font-medium px-4 py-2 bg-white/5 hover:bg-fuchsia-500/10 rounded-xl transition-all text-sm border border-white/5 hover:border-fuchsia-500/30 shadow-sm"
          >
            Editar
          </button>
        )}
      />
    </motion.div>
  );
}
