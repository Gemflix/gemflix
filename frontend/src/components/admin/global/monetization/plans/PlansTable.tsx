import { CreditCard, Crown, Star, Check } from "lucide-react";
import { DataTable, Column } from "../../../ui/DataTable";
import { motion } from "framer-motion";

export interface PlanPrice {
  currency: string;
  price_cents: number;
  interval: string;
}

export interface VIPPlan {
  id: number;
  key: string;
  category: string;
  name: string;
  description: string;
  color: string;
  priority: number;
  badge: string;
  is_featured: boolean;
  max_profiles: number;
  max_devices: number;
  max_pending_requests: number;
  parental_control: boolean;
  features: string[];
  is_active: boolean;
  sort_order: number;
  prices: PlanPrice[];
}

interface PlansTableProps {
  plans: VIPPlan[];
  loading: boolean;
  onEdit?: (plan: VIPPlan) => void;
}

export function PlansTable({ plans, loading, onEdit }: PlansTableProps) {
  
  const columns: Column<VIPPlan>[] = [
    {
      key: 'name',
      label: 'Plan VIP',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          <div 
            className="p-3 rounded-xl shadow-lg relative overflow-hidden" 
            style={{ backgroundColor: item.color ? `${item.color}20` : '#f59e0b20', color: item.color || '#f59e0b' }}
          >
            {item.is_featured && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />}
            {item.max_profiles > 1 ? <Crown size={22} /> : <Star size={22} />}
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              {item.name}
              {item.is_featured && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">Destacado</span>}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 max-w-50 truncate">{item.category || 'Sin Categoría'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'features',
      label: 'Límites',
      render: (item) => (
        <div className="flex flex-col gap-1.5 text-sm text-gray-400">
          <div className="flex items-center justify-between bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
            <span>Perfiles:</span> 
            <span className="text-white font-medium">{item.max_profiles}</span>
          </div>
          <div className="flex items-center justify-between bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
            <span>Dispositivos:</span> 
            <span className="text-white font-medium">{item.max_devices}</span>
          </div>
        </div>
      )
    },
    {
      key: 'prices',
      label: 'Precio',
      render: (item) => {
        if (!item.prices || item.prices.length === 0) return <span className="text-gray-500 text-sm italic">Gratis / No definidos</span>;
        const mainPrice = item.prices.find(p => p.interval === 'monthly') || item.prices[0];
        
        return (
          <div className="flex items-center gap-1.5 text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg w-max">
            <span className="text-gray-400 font-medium">$</span>
            <span className="font-bold text-lg">{mainPrice.price_cents / 100}</span>
            <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">/ {mainPrice.interval.substring(0,2)}</span>
          </div>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 w-max ${
          item.is_active ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.is_active && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
          {item.is_active ? 'DISPONIBLE' : 'OCULTO'}
        </span>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={plans}
        columns={columns}
        loading={loading}
        emptyIcon={CreditCard}
        emptyMessage="No has configurado ningún plan VIP."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-accent font-medium px-4 py-2 bg-white/5 hover:bg-accent/10 rounded-xl transition-all text-sm border border-white/5 hover:border-accent/30 shadow-sm"
          >
            Editar Plan
          </button>
        )}
      />
    </motion.div>
  );
}
