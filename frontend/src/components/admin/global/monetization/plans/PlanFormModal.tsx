import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { VIPPlan, PlanPrice } from "./PlansTable";

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  plan?: VIPPlan | null;
  isSubmitting?: boolean;
}

export function PlanFormModal({ isOpen, onClose, onSubmit, plan, isSubmitting }: PlanFormModalProps) {
  const isEditing = !!plan;

  const [formData, setFormData] = useState<Partial<VIPPlan>>({
    features: [],
    prices: [],
    max_profiles: 1,
    max_devices: 1,
    is_active: true,
    priority: 1,
    sort_order: 1,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(plan ? { ...plan } : {
        features: [],
        prices: [],
        max_profiles: 1,
        max_devices: 1,
        is_active: true,
        priority: 1,
        sort_order: 1,
      });
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const handleChange = (field: keyof VIPPlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    handleChange('features', newFeatures);
  };

  const addFeature = () => {
    handleChange('features', [...(formData.features || []), '']);
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    handleChange('features', newFeatures);
  };

  const handlePriceChange = (index: number, field: keyof PlanPrice, value: any) => {
    const newPrices = [...(formData.prices || [])];
    newPrices[index] = { ...newPrices[index], [field]: value };
    handleChange('prices', newPrices);
  };

  const addPrice = () => {
    handleChange('prices', [...(formData.prices || []), { currency: 'USD', interval: 'monthly', price_cents: 0 }]);
  };

  const removePrice = (index: number) => {
    const newPrices = [...(formData.prices || [])];
    newPrices.splice(index, 1);
    handleChange('prices', newPrices);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1a1c23] border border-surface-border rounded-xl shadow-2xl shadow-black w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? `Editar Plan: ${plan?.name}` : 'Añadir Nuevo Plan'}</h2>
            <p className="text-sm text-gray-400 mt-1">Configura los beneficios y precios de tu plan de monetización.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Clave (Única) *</label>
              <input required value={formData.key || ''} onChange={e => handleChange('key', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Nombre *</label>
              <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Categoría</label>
              <input value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Color (Tailwind class / Hex)</label>
              <input value={formData.color || ''} onChange={e => handleChange('color', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Descripción</label>
            <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none min-h-20" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Máx Perfiles</label>
              <input type="number" required value={formData.max_profiles || 1} onChange={e => handleChange('max_profiles', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Máx Dispositivos</label>
              <input type="number" required value={formData.max_devices || 1} onChange={e => handleChange('max_devices', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Prioridad</label>
              <input type="number" value={formData.priority || 1} onChange={e => handleChange('priority', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent/50 outline-none" />
            </div>
          </div>

          {/* Features */}
          <div className="border border-white/10 rounded-xl p-4 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Características (Features)</label>
              <button type="button" onClick={addFeature} className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-gray-300">
                <Plus size={14} /> Añadir
              </button>
            </div>
            <div className="space-y-2">
              {formData.features?.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="Ej: Sin anuncios"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 p-1.5 hover:bg-white/5 rounded-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!formData.features?.length && <div className="text-xs text-gray-500 italic">No hay características configuradas.</div>}
            </div>
          </div>

          {/* Precios */}
          <div className="border border-white/10 rounded-xl p-4 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Precios (Opcional)</label>
              <button type="button" onClick={addPrice} className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-gray-300">
                <Plus size={14} /> Añadir Precio
              </button>
            </div>
            <div className="space-y-3">
              {formData.prices?.map((price, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                  <select
                    value={price.interval}
                    onChange={e => handlePriceChange(idx, 'interval', e.target.value)}
                    className="bg-transparent text-sm text-white border-r border-white/10 px-2 outline-none"
                  >
                    <option value="monthly" className="bg-[#1a1c23]">Mensual</option>
                    <option value="yearly" className="bg-[#1a1c23]">Anual</option>
                    <option value="lifetime" className="bg-[#1a1c23]">De por vida</option>
                  </select>

                  <div className="flex items-center gap-1 flex-1 px-2">
                    <span className="text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={price.price_cents ? price.price_cents / 100 : ''}
                      onChange={e => handlePriceChange(idx, 'price_cents', Math.round(Number(e.target.value) * 100))}
                      placeholder="9.99"
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>

                  <select
                    value={price.currency}
                    onChange={e => handlePriceChange(idx, 'currency', e.target.value)}
                    className="bg-transparent text-sm text-white border-l border-white/10 px-2 outline-none w-20"
                  >
                    <option value="USD" className="bg-[#1a1c23]">USD</option>
                    <option value="EUR" className="bg-[#1a1c23]">EUR</option>
                  </select>

                  <button type="button" onClick={() => removePrice(idx)} className="text-red-400 p-1.5 hover:bg-white/5 rounded-md ml-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!formData.prices?.length && <div className="text-xs text-gray-500 italic">Plan gratuito (sin precios configurados).</div>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Plan Visible (Activo)</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={Boolean(formData.is_active)}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
              <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-300 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmitForm} disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-light shadow-lg shadow-accent/20 flex items-center gap-2">
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
