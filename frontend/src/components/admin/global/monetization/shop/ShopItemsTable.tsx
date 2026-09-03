import { Store, Image as ImageIcon, CircleUserRound, Shield, Star, Tag } from "lucide-react";
import { DataTable, Column } from "../../../ui/DataTable";
import { motion } from "framer-motion";

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  type: string; // 'avatar', 'frame', 'badge'
  price_tokens: number;
  is_active: boolean;
  preview_url: string;
  preview_css: string;
  created_at?: string;
}

interface ShopItemsTableProps {
  items: ShopItem[];
  loading: boolean;
  onEdit?: (item: ShopItem) => void;
}

export function ShopItemsTable({ items, loading, onEdit }: ShopItemsTableProps) {
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'avatar': return <CircleUserRound size={16} />;
      case 'frame': return <ImageIcon size={16} />;
      case 'badge': return <Shield size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'avatar': return 'Avatar';
      case 'frame': return 'Marco';
      case 'badge': return 'Insignia';
      default: return 'Artículo';
    }
  };

  const columns: Column<ShopItem>[] = [
    {
      key: 'name',
      label: 'Artículo',
      render: (item) => (
        <div className="flex items-center gap-4 py-1">
          {/* Avatar Pequeño de Muestra */}
          <div className="w-12 h-12 shrink-0 rounded-full bg-black/50 border border-white/10 flex items-center justify-center relative shadow-lg">
            {item.type === 'avatar' && item.preview_url ? (
              <img src={item.preview_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <CircleUserRound size={20} className="text-gray-500" />
            )}
            
            {item.type === 'frame' && (
              <div className={`absolute inset-0 rounded-full pointer-events-none ${item.preview_css || 'ring-2 ring-emerald-500'}`} />
            )}

            {item.type === 'badge' && item.preview_url && (
              <img src={item.preview_url} alt="" className="absolute -bottom-1 -right-1 w-5 h-5 object-contain drop-shadow-md" />
            )}
          </div>
          
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              {item.name}
            </div>
            <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1 font-medium tracking-wider uppercase">
              {getTypeIcon(item.type)} {getTypeName(item.type)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-max shadow-sm">
          <Star size={16} />
          <span className="font-bold">{item.price_tokens}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 w-max ${
          item.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.is_active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {item.is_active ? 'EN VENTA' : 'OCULTO'}
        </span>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyIcon={Store}
        emptyMessage="La tienda está vacía. Añade avatares y marcos."
        actions={(item) => (
          <button 
            onClick={() => onEdit?.(item)}
            className="text-white hover:text-emerald-400 font-medium px-4 py-2 bg-white/5 hover:bg-emerald-500/10 rounded-xl transition-all text-sm border border-white/5 hover:border-emerald-500/30 shadow-sm"
          >
            Editar
          </button>
        )}
      />
    </motion.div>
  );
}
