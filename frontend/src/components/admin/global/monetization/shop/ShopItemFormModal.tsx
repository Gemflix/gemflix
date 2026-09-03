import React, { useState, useEffect } from "react";
import { X, Check, Store, Image as ImageIcon, CircleUserRound, Shield, Tag, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShopItem } from "./ShopItemsTable";

interface ShopItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  item?: ShopItem | null;
  isSubmitting?: boolean;
}

export function ShopItemFormModal({ isOpen, onClose, onSubmit, item, isSubmitting }: ShopItemFormModalProps) {
  const isEditing = !!item;

  const [formData, setFormData] = useState<Partial<ShopItem>>({
    name: "",
    description: "",
    type: "avatar",
    price_tokens: 100,
    is_active: true,
    preview_url: "",
    preview_css: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(item ? { ...item } : {
        name: "",
        description: "",
        type: "avatar",
        price_tokens: 100,
        is_active: true,
        preview_url: "",
        preview_css: "",
      });
    }
  }, [isOpen, item]);

  const handleChange = (field: keyof ShopItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price_tokens: Number(formData.price_tokens || 0),
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'avatar': return <CircleUserRound size={16} />;
      case 'frame': return <ImageIcon size={16} />;
      case 'badge': return <Shield size={16} />;
      default: return <Tag size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-[#12141a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Store size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? `Editar Artículo: ${item?.name}` : 'Nuevo Artículo en la Tienda'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Avatares, marcos e insignias comprables con tokens.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Formulario Principal */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-300">Nombre del Artículo *</label>
                      <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Ej: Avatar Cyberpunk" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-300">Tipo de Artículo *</label>
                      <div className="relative">
                        <select required value={formData.type || 'avatar'} onChange={e => handleChange('type', e.target.value)} className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none">
                          <option value="avatar">Avatar</option>
                          <option value="frame">Marco (Frame)</option>
                          <option value="badge">Insignia (Badge)</option>
                        </select>
                        <div className="absolute left-4 top-3.5 text-emerald-400 pointer-events-none">
                          {getTypeIcon(formData.type || 'avatar')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Descripción</label>
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="Descripción para mostrar en la tienda..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none min-h-20" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                      <Star size={16} /> Precio (Tokens) *
                    </label>
                    <input type="number" required min="0" value={formData.price_tokens || 0} onChange={e => handleChange('price_tokens', Number(e.target.value))} className="w-full bg-black/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">URL de la Imagen (Opcional)</label>
                      <input value={formData.preview_url || ''} onChange={e => handleChange('preview_url', e.target.value)} placeholder="https://ejemplo.com/avatar.png" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 transition-all outline-none text-sm" />
                    </div>
                    
                    {formData.type === 'frame' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estilos CSS (Tailwind) del Marco</label>
                        <input value={formData.preview_css || ''} onChange={e => handleChange('preview_css', e.target.value)} placeholder="Ej: ring-4 ring-amber-500 shadow-amber-500" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 transition-all outline-none" />
                        <p className="text-[11px] text-gray-500">Clases de Tailwind CSS que se aplicarán al contenedor del avatar.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vista Previa */}
                <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
                  <label className="text-sm font-semibold text-gray-300 mb-6 self-start md:self-auto">Vista Previa</label>
                  
                  <div className="w-32 h-32 rounded-full bg-black/50 border-2 border-white/10 flex items-center justify-center relative shadow-2xl mb-6">
                    {/* El Avatar */}
                    {formData.type === 'avatar' && formData.preview_url ? (
                      <img src={formData.preview_url} alt="Preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <CircleUserRound size={48} className="text-gray-600" />
                    )}

                    {/* El Marco */}
                    {formData.type === 'frame' && (
                      <div className={`absolute inset-0 rounded-full pointer-events-none ${formData.preview_css || 'ring-2 ring-emerald-500'}`} />
                    )}

                    {/* La Insignia */}
                    {formData.type === 'badge' && formData.preview_url && (
                      <img src={formData.preview_url} alt="Badge" className="absolute -bottom-2 -right-2 w-10 h-10 object-contain drop-shadow-lg" />
                    )}
                  </div>
                  
                  <div className="text-center w-full">
                    <h4 className="font-bold text-white truncate px-2">{formData.name || 'Sin Nombre'}</h4>
                    <div className="flex items-center justify-center gap-1 text-amber-500 mt-1 font-medium">
                      <Star size={14} /> {formData.price_tokens || 0}
                    </div>
                  </div>

                  <div className="mt-8 w-full">
                    <label className="flex items-center gap-3 cursor-pointer group bg-black/30 px-5 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                      <div className={`relative w-10 h-5 transition-colors rounded-full ${formData.is_active ? 'bg-emerald-500' : 'bg-red-500/50'}`}>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-5' : ''}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={!!formData.is_active} onChange={e => handleChange('is_active', e.target.checked)} />
                      <span className={`text-xs font-bold ${formData.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formData.is_active ? 'EN VENTA' : 'OCULTO'}
                      </span>
                    </label>
                  </div>

                </div>

              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/1">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmitForm} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Crear Artículo'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
