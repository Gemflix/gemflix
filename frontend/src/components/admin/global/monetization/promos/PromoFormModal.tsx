import React, { useState, useEffect } from "react";
import { X, Check, Ticket, Calendar, Percent, Coins, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PromoCode } from "./PromosTable";

interface PromoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  promo?: PromoCode | null;
  isSubmitting?: boolean;
}

export function PromoFormModal({ isOpen, onClose, onSubmit, promo, isSubmitting }: PromoFormModalProps) {
  const isEditing = !!promo;

  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: "",
    type: "fixed",
    value: 100,
    max_uses: 0,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(promo ? { 
        ...promo,
        valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().slice(0,16) : "",
        valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0,16) : "",
      } : {
        code: "",
        type: "fixed",
        value: 100,
        max_uses: 0,
        valid_from: "",
        valid_until: "",
        is_active: true,
      });
    }
  }, [isOpen, promo]);

  const handleChange = (field: keyof PromoCode, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange('code', result);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value || 0),
      max_uses: Number(formData.max_uses || 0),
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fixed': return <Coins size={16} />;
      case 'percentage': return <Percent size={16} />;
      case 'free_days': return <Calendar size={16} />;
      default: return <Coins size={16} />;
    }
  };

  const getTypeValueLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'Cantidad de Tokens';
      case 'percentage': return 'Porcentaje de Descuento (%)';
      case 'free_days': return 'Días VIP Gratis';
      default: return 'Valor';
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
            className="relative bg-[#12141a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl">
                  <Ticket size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? `Editar Código: ${promo?.code}` : 'Nuevo Código Promocional'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Crea descuentos y regalos para tus usuarios.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* Código */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Código Promocional *</label>
                <div className="flex items-center gap-3">
                  <input 
                    required 
                    value={formData.code || ''} 
                    onChange={e => handleChange('code', e.target.value.toUpperCase())} 
                    placeholder="Ej: NAVIDAD2026" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest placeholder-gray-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" 
                  />
                  {!isEditing && (
                    <button 
                      type="button"
                      onClick={generateRandomCode}
                      className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition-colors"
                      title="Generar Aleatorio"
                    >
                      <RefreshCw size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Tipo de Recompensa *</label>
                  <div className="relative">
                    <select required disabled={isEditing} value={formData.type || 'fixed'} onChange={e => handleChange('type', e.target.value)} className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none disabled:opacity-50">
                      <option value="fixed">Tokens Directos</option>
                      <option value="percentage">Descuento en Checkout (%)</option>
                      <option value="free_days">Suscripción VIP Gratis (Días)</option>
                    </select>
                    <div className="absolute left-4 top-3.5 text-fuchsia-400 pointer-events-none">
                      {getTypeIcon(formData.type || 'fixed')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-fuchsia-400">{getTypeValueLabel(formData.type || 'fixed')} *</label>
                  <div className="relative">
                    <input type="number" required min="1" value={formData.value || ''} onChange={e => handleChange('value', Number(e.target.value))} className="w-full bg-black/50 border border-fuchsia-500/30 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                    <div className="absolute left-4 top-3.5 text-fuchsia-500 pointer-events-none">
                      {getTypeIcon(formData.type || 'fixed')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-white/2 border border-white/5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usos Máximos</label>
                  <input type="number" min="0" value={formData.max_uses || 0} onChange={e => handleChange('max_uses', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-fuchsia-500 transition-all outline-none" />
                  <p className="text-[11px] text-gray-500">0 = Ilimitado</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Válido Desde</label>
                  <input type="datetime-local" value={formData.valid_from || ''} onChange={e => handleChange('valid_from', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-fuchsia-500 transition-all outline-none text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Válido Hasta</label>
                  <input type="datetime-local" value={formData.valid_until || ''} onChange={e => handleChange('valid_until', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-fuchsia-500 transition-all outline-none text-sm" />
                </div>
              </div>

              <div className="flex justify-end">
                <label className="flex items-center gap-3 cursor-pointer group bg-black/30 px-5 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                  <div className={`relative w-12 h-6 transition-colors rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500/50'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={!!formData.is_active} onChange={e => handleChange('is_active', e.target.checked)} />
                  <span className={`text-sm font-bold ${formData.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.is_active ? 'CÓDIGO ACTIVO' : 'DESACTIVADO'}
                  </span>
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/1">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmitForm} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Crear Código'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
