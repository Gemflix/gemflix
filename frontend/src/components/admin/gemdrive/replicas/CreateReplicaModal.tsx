import { useState } from "react";
import { X, Server, Save, HardDrive } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ServiceAccount } from "@/components/admin/gemdrive/accounts/AccountsTable";

interface CreateReplicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: ServiceAccount[];
}

export function CreateReplicaModal({ isOpen, onClose, onSuccess, accounts }: CreateReplicaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "GemReplicas",
    service_account_id: "",
    shared_drive_id: "",
    streaming_folder_id: "",
    gemdrive_folder_id: "",
    recovery_folder_id: "",
    space_limit_gib: 2000,
    priority: 1
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/admin/drive/replicas", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          service_account_id: parseInt(formData.service_account_id),
          space_limit_gib: parseInt(formData.space_limit_gib.toString()),
          priority: parseInt(formData.priority.toString())
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear la réplica");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="text-accent" />
            Nueva Réplica (Target)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Nombre Descriptivo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
                placeholder="Ej. GemReplicas - Cuenta 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Cuenta de Servicio Asignada</label>
              <select
                required
                value={formData.service_account_id}
                onChange={e => setFormData({...formData, service_account_id: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
              >
                <option value="">Selecciona una cuenta...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">ID del Shared Drive</label>
              <input
                type="text"
                required
                value={formData.shared_drive_id}
                onChange={e => setFormData({...formData, shared_drive_id: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white font-mono text-sm"
                placeholder="0AJxxxxxxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                ID Carpeta Streaming <span className="text-xs bg-accent/20 text-accent px-2 rounded">Opcional</span>
              </label>
              <input
                type="text"
                value={formData.streaming_folder_id}
                onChange={e => setFormData({...formData, streaming_folder_id: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                ID Carpeta Principal <span className="text-xs bg-accent/20 text-accent px-2 rounded">Opcional</span>
              </label>
              <input
                type="text"
                value={formData.gemdrive_folder_id}
                onChange={e => setFormData({...formData, gemdrive_folder_id: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Límite de Espacio (GB)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.space_limit_gib}
                  onChange={e => setFormData({...formData, space_limit_gib: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-10 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">GB</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Prioridad</label>
              <input
                type="number"
                required
                min="1"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Número mayor = se llenará primero.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg font-medium bg-accent hover:bg-accent-light text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Réplica"}
              {!loading && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
