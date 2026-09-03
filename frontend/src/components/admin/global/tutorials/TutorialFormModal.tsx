import React, { useState, useEffect } from "react";
import { X, Check, PlaySquare, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tutorial } from "./TutorialsTable";

interface TutorialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  tutorial?: Tutorial | null;
  isSubmitting?: boolean;
}

export function TutorialFormModal({ isOpen, onClose, onSubmit, tutorial, isSubmitting }: TutorialFormModalProps) {
  const isEditing = !!tutorial;

  const [formData, setFormData] = useState<Partial<Tutorial>>({
    title: "",
    description: "",
    video_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(tutorial ? { ...tutorial } : {
        title: "",
        description: "",
        video_url: "",
        is_active: true,
      });
    }
  }, [isOpen, tutorial]);

  const handleChange = (field: keyof Tutorial, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <PlaySquare size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? `Editar Tutorial: ${tutorial?.title}` : 'Nuevo Tutorial'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Añade videos guía para los usuarios.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Título del Tutorial *</label>
                <input 
                  required 
                  value={formData.title || ''} 
                  onChange={e => handleChange('title', e.target.value)} 
                  placeholder="Ej: Cómo conectar a la TV" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Descripción</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => handleChange('description', e.target.value)} 
                  placeholder="Instrucciones breves o resumen del video..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none min-h-24" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-blue-400">URL del Video (YouTube / MP4) *</label>
                <div className="relative">
                  <input 
                    type="url" 
                    required 
                    value={formData.video_url || ''} 
                    onChange={e => handleChange('video_url', e.target.value)} 
                    placeholder="https://youtube.com/watch?v=..." 
                    className="w-full bg-black/50 border border-blue-500/30 rounded-xl px-4 py-3 pl-11 text-white focus:border-blue-500 transition-all outline-none" 
                  />
                  <div className="absolute left-4 top-3.5 text-blue-500 pointer-events-none">
                    <LinkIcon size={18} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group bg-black/30 px-5 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors w-max">
                  <div className={`relative w-12 h-6 transition-colors rounded-full ${formData.is_active ? 'bg-blue-500' : 'bg-red-500/50'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={!!formData.is_active} onChange={e => handleChange('is_active', e.target.checked)} />
                  <span className={`text-sm font-bold ${formData.is_active ? 'text-blue-400' : 'text-red-400'}`}>
                    {formData.is_active ? 'PÚBLICO' : 'OCULTO'}
                  </span>
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/1 shrink-0">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmitForm} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Publicar Tutorial'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
