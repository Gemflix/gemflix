import React, { useState, useEffect } from "react";
import { X, Check, Shield, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "./RolesTable";

export interface Permission {
  name: string;
  group: string;
  description: string;
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  role?: Role | null;
  availablePermissions: Permission[];
  isSubmitting?: boolean;
}

export function RoleFormModal({ isOpen, onClose, onSubmit, role, availablePermissions, isSubmitting }: RoleFormModalProps) {
  const isEditing = !!role;

  const [formData, setFormData] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(role ? { ...role, permissions: role.permissions || [] } : {
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [isOpen, role]);

  const handleChange = (field: keyof Role, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permName: string) => {
    setFormData(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(permName)) {
        return { ...prev, permissions: perms.filter(p => p !== permName) };
      } else {
        return { ...prev, permissions: [...perms, permName] };
      }
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Group permissions by their 'group' field
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            className="relative bg-[#12141a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >

            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? `Editar Rol: ${role?.name}` : 'Nuevo Rol de Sistema'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Asigna permisos específicos para el personal.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 flex flex-col md:flex-row gap-8">

              <div className="flex-1 space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Nombre del Rol *</label>
                  <input
                    required
                    disabled={role?.is_system}
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value.toLowerCase())}
                    placeholder="Ej: soporte"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
                  />
                  {role?.is_system && <p className="text-xs text-amber-500">Este es un rol de sistema, el nombre no se puede cambiar.</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Descripción</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Describe qué hace este rol..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none min-h-20"
                  />
                </div>
              </div>

              <div className="flex-2 bg-black/30 border border-white/5 rounded-xl p-5 overflow-y-auto max-h-[50vh] custom-scrollbar">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Key size={18} className="text-blue-400" /> Checklist de Permisos
                </h3>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group} className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">{group}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const isSelected = formData.permissions?.includes(perm.name);
                          return (
                            <label key={perm.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
                              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-500'}`}>
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                              <div>
                                <div className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>{perm.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{perm.description}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/1 shrink-0">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmitForm} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
