import React, { useState, useEffect } from "react";
import { X, Check, Megaphone, Link as LinkIcon, DollarSign, LayoutTemplate, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdCampaign } from "./AdsTable";

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  ad?: AdCampaign | null;
  isSubmitting?: boolean;
}

export function AdFormModal({ isOpen, onClose, onSubmit, ad, isSubmitting }: AdFormModalProps) {
  const isEditing = !!ad;

  const [formData, setFormData] = useState<Partial<AdCampaign>>({
    company: "",
    type: "smartlink",
    content: "",
    is_rewarded: false,
    reward_tokens: 0,
    daily_limit: 0,
    priority: 1,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(ad ? { ...ad } : {
        company: "",
        type: "smartlink",
        content: "",
        is_rewarded: false,
        reward_tokens: 0,
        daily_limit: 0,
        priority: 1,
        is_active: true,
      });
    }
  }, [isOpen, ad]);

  const handleChange = (field: keyof AdCampaign, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      reward_tokens: Number(formData.reward_tokens || 0),
      daily_limit: Number(formData.daily_limit || 0),
      priority: Number(formData.priority || 1),
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'smartlink': return <LinkIcon size={16} />;
      case 'shortener': return <LinkIcon size={16} />;
      case 'banner': return <LayoutTemplate size={16} />;
      case 'interstitial': return <Box size={16} />;
      case 'vast': return <Megaphone size={16} />;
      default: return <LayoutTemplate size={16} />;
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
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? `Editar Anuncio: ${ad?.company}` : 'Nueva Campaña Publicitaria'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Configura la monetización por cascada (Waterfall).</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Empresa / Red Publicitaria *</label>
                  <input required value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} placeholder="Ej: Monetag, Adsterra, Shrinkme..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Tipo de Anuncio *</label>
                  <div className="relative">
                    <select required value={formData.type || 'smartlink'} onChange={e => handleChange('type', e.target.value)} className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none">
                      <option value="smartlink">Smartlink / Direct Link</option>
                      <option value="shortener">Acortador (Shortener)</option>
                      <option value="banner">Banner (HTML/JS)</option>
                      <option value="interstitial">Pop-under / Interstitial</option>
                      <option value="vast">VAST (Video Ad)</option>
                      <option value="native">Nativo</option>
                    </select>
                    <div className="absolute left-4 top-3.5 text-blue-400 pointer-events-none">
                      {getTypeIcon(formData.type || 'smartlink')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Contenido (URL o Script / API Key) *</label>
                <textarea required value={formData.content || ''} onChange={e => handleChange('content', e.target.value)} placeholder="Inserta aquí la URL del acortador o el script proporcionado por la red..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none min-h-30 font-mono text-sm" />
              </div>

              {/* Cascada y Límites */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-white/2 border border-white/5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Prioridad (Waterfall)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="100" value={formData.priority || 1} onChange={e => handleChange('priority', Number(e.target.value))} className="w-full accent-blue-500" />
                    <input type="number" min="1" max="100" value={formData.priority || 1} onChange={e => handleChange('priority', Number(e.target.value))} className="w-16 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <p className="text-[11px] text-gray-500">Un valor más alto (ej. 100) se mostrará primero.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Límite Diario (Por Usuario)</label>
                  <input type="number" min="0" value={formData.daily_limit || 0} onChange={e => handleChange('daily_limit', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 transition-all outline-none" />
                  <p className="text-[11px] text-gray-500">0 = Sin límite. Útil para acortadores que solo pagan 1 vez al día por IP.</p>
                </div>
              </div>

              {/* Recompensas Gamificadas */}
              <div className="rounded-2xl p-5 bg-linear-to-br from-amber-500/5 to-transparent border border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                      <DollarSign size={16} /> Recompensa de Tokens
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Otorga tokens de Billetera si el usuario completa el anuncio.</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative w-12 h-6 transition-colors rounded-full ${formData.is_rewarded ? 'bg-amber-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_rewarded ? 'translate-x-6' : ''}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={!!formData.is_rewarded} onChange={e => handleChange('is_rewarded', e.target.checked)} />
                  </label>
                </div>
                
                <AnimatePresence>
                  {formData.is_rewarded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 pt-2"
                    >
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Cantidad de Tokens a Regalar</label>
                      <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-amber-500 transition-all">
                        <DollarSign size={16} className="text-amber-500" />
                        <input type="number" min="1" value={formData.reward_tokens || 0} onChange={e => handleChange('reward_tokens', Number(e.target.value))} className="w-full bg-transparent text-white outline-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end">
                <label className="flex items-center gap-3 cursor-pointer group bg-black/30 px-5 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                  <div className={`relative w-12 h-6 transition-colors rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500/50'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={!!formData.is_active} onChange={e => handleChange('is_active', e.target.checked)} />
                  <span className={`text-sm font-bold ${formData.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.is_active ? 'ANUNCIO ACTIVO' : 'PAUSADO'}
                  </span>
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/1">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmitForm} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Crear Anuncio'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
