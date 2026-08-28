import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ServiceAccount } from "@/components/admin/gemdrive/accounts/AccountsTable";

interface CreateSourceModalProps {
  accounts: ServiceAccount[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSourceModal({ accounts, onClose, onSuccess }: CreateSourceModalProps) {
  const [name, setName] = useState("");
  const [serviceAccountId, setServiceAccountId] = useState(accounts.length > 0 ? String(accounts[0].id) : "");
  const [folderId, setFolderId] = useState("");
  const [driveType, setDriveType] = useState("shared_folder");
  const [sharedDriveId, setSharedDriveId] = useState("");
  const [syncMode, setSyncMode] = useState("full");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const config = {
      drive_type: driveType,
      shared_drive_id: sharedDriveId,
      sync_mode: syncMode
    };

    const payload = {
      name,
      service_account_id: parseInt(serviceAccountId),
      folder_id: folderId,
      provider: "google_drive", // Reusing provider to hold generic provider while config holds specific data
      sync_interval_minutes: 60
    };

    try {
      const response = await apiFetch("/api/admin/drive/sources", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Error al crear la fuente");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1c23] border border-surface-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-surface-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Registrar Fuente Google Drive</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">¿Qué representa una fuente?</h3>
              <p className="text-sm text-gray-400 mt-1">Una fuente es una raíz Google Drive tratada como solo lectura. Gemflix indexa metadata de forma autoritativa y nunca elimina ni modifica el original.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nombre Administrativo</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent" placeholder="Ej: Películas Premium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Cuenta de Servicio a utilizar</label>
                <select required value={serviceAccountId} onChange={e => setServiceAccountId(e.target.value)} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent">
                  {accounts.length === 0 && <option value="">No hay cuentas activas</option>}
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">¿No tienes cuentas? Registra una en el menú Cuentas.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <h3 className="text-lg font-semibold text-white">Configuración del Origen (Drive)</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tipo de Origen</label>
              <select value={driveType} onChange={e => setDriveType(e.target.value)} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent">
                <option value="shared_folder">Tipo 1 — Carpeta Compartida externa (Solo lectura normal)</option>
                <option value="external_team_drive">Tipo 2 — Shared Drive externo (Requiere Shared Drive ID)</option>
                <option value="managed_team_drive">Tipo 3 — Shared Drive administrado (Propiedad del sistema)</option>
              </select>
              <p className="text-xs text-gray-500">Es crítico seleccionar el correcto, esto determina si se usa `corpora=drive` y el nivel de permisos que se asume.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">ID de la carpeta raíz</label>
                <input required type="text" value={folderId} onChange={e => setFolderId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent font-mono text-sm" placeholder="1A2B3C..." />
                <p className="text-xs text-gray-500">Se encuentra en la URL de Drive: drive.google.com/drive/folders/[AQUÍ]</p>
              </div>
              {(driveType === 'external_team_drive' || driveType === 'managed_team_drive') && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-sm font-medium text-gray-300">ID del Shared Drive</label>
                  <input required type="text" value={sharedDriveId} onChange={e => setSharedDriveId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent font-mono text-sm" placeholder="0A1B2C..." />
                  <p className="text-xs text-gray-500">Necesario para la API v3. Obligatorio si el origen no es "Mi unidad".</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <h3 className="text-lg font-semibold text-white">Modo de Sincronización</h3>
              <p className="text-sm text-gray-400 mt-1">Cómo se comportará el worker al indexar los archivos hacia la base de datos de Gemflix.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <RefreshCw size={14} className="text-accent" /> Comportamiento (Policy)
              </label>
              <select value={syncMode} onChange={e => setSyncMode(e.target.value)} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent">
                <option value="full">Full — Reconstrucción autoritativa completa (Seguro pero lento)</option>
                <option value="delta">Delta seguro — Changes API y refresco solo al haber cambios detectados (Recomendado)</option>
                <option value="append">Append — Agrega o actualiza metadatos pero nunca desactiva los ausentes</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" disabled={accounts.length === 0 || isSubmitting} className="bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              {isSubmitting ? "Guardando..." : "Guardar Fuente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
