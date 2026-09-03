import React from 'react';
import { X } from 'lucide-react';

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'switch';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // Para selects
  defaultValue?: any;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: any;
  isSubmitting?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  fields,
  initialData = {},
  isSubmitting = false
}: FormModalProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>(initialData);

  // Reiniciar estado cuando se abre/cierra o cambia initialData
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-[#1a1c23] border border-surface-border rounded-xl shadow-2xl shadow-black w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {fields.map((field) => {
            const value = formData[field.name] !== undefined ? formData[field.name] : field.defaultValue || '';
            
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-400">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-colors min-h-25 resize-y"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">Seleccione una opción</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#1a1c23]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'switch' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={Boolean(value)}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-300 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={value}
                    onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                )}
              </div>
            );
          })}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-light transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
