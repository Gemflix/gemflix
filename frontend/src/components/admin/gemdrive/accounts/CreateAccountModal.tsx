import { useState } from "react";
import { Key } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CreateAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAccountModal({ onClose, onSuccess }: CreateAccountModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("personal");
  const [credentialSource, setCredentialSource] = useState("database");
  const [refreshToken, setRefreshToken] = useState("");
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [quotaLimitGib, setQuotaLimitGib] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const credentials = {
      type: accountType,
      source: credentialSource,
      ...(accountType === 'bot' && credentialSource === 'database' ? { json: serviceAccountJson } : {}),
      ...((accountType === 'personal' || accountType === 'workspace') && credentialSource === 'database' ? { refresh_token: refreshToken } : {})
    };

    const payload = {
      name,
      email,
      provider: "google_drive",
      credentials_json: JSON.stringify(credentials),
      quota_limit_bytes: quotaLimitGib * 1024 * 1024 * 1024,
    };

    try {
      const response = await apiFetch("/api/admin/drive/accounts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Error al crear la cuenta");
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
          <h2 className="text-xl font-bold text-white">Registrar Identidad Google</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">¿Para qué sirve esta pantalla?</h3>
              <p className="text-sm text-gray-400 mt-1">Registra identidades Google. La función real (sync, delivery o replicator) se asigna después dentro de cada fuente o destino GemReplicas.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Correo de la Identidad</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent" placeholder="email@gmail.com" />
                <p className="text-xs text-gray-500">Cuenta personal/Workspace o client_email de una Service Account.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nombre Administrativo</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent" placeholder="Ej: Cuenta Principal" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Naturaleza de la Identidad</label>
                <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent">
                  <option value="personal">Cuenta Personal OAuth</option>
                  <option value="workspace">Cuenta Workspace OAuth</option>
                  <option value="bot">Google Service Account (Bot)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Dónde se guarda la credencial</label>
                <select value={credentialSource} onChange={e => setCredentialSource(e.target.value)} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent">
                  <option value="database">Base de datos cifrada (Recomendado)</option>
                  <option value="env">Bootstrap temporal desde .env</option>
                </select>
                <p className="text-xs text-gray-500">ENV solo debe usarse para la primera cuenta OAuth mientras se completa la configuración. Las cuentas adicionales van cifradas en BD.</p>
              </div>
            </div>
          </div>

          {credentialSource === 'database' && (accountType === 'personal' || accountType === 'workspace') && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-white">Credencial OAuth Autorizada</h3>
                <p className="text-sm text-gray-400 mt-1">Campo write-only. Al editar aparece vacío; dejarlo vacío conserva el refresh token cifrado existente.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Key size={14} className="text-accent" />
                  Refresh Token Google
                </label>
                <input required type="password" value={refreshToken} onChange={e => setRefreshToken(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent font-mono text-sm" placeholder="1//0e..." />
                <p className="text-xs text-gray-500">Nunca se muestra después de guardar. Debe provenir del mismo OAuth Client configurado en GOOGLE_CLIENT_ID/SECRET.</p>
              </div>
            </div>
          )}

          {credentialSource === 'database' && accountType === 'bot' && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-white">Credencial de Service Account</h3>
                <p className="text-sm text-gray-400 mt-1">Campo write-only. No se expone en tablas ni respuestas JSON.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Key size={14} className="text-accent" />
                  JSON completo de Google Service Account
                </label>
                <textarea required rows={8} value={serviceAccountJson} onChange={e => setServiceAccountJson(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-accent font-mono text-xs" placeholder="{...}"></textarea>
                <p className="text-xs text-gray-500">Debe contener type, project_id, private_key y client_email.</p>
              </div>
            </div>
          )}

          {credentialSource === 'env' && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-white">Bootstrap ENV</h3>
                <p className="text-sm text-gray-400 mt-1">No guarda secretos en base de datos. Requiere GOOGLE_DRIVE_BOOTSTRAP_EMAIL y GOOGLE_DRIVE_BOOTSTRAP_REFRESH_TOKEN en el servidor.</p>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <h3 className="text-lg font-semibold text-white">Cuota operativa interna</h3>
              <p className="text-sm text-gray-400 mt-1">No modifica la cuota oficial de Google. Ayuda a reservar espacio, rotar identidades y evitar iniciar una copia que no cabe.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Límite interno (GiB)</label>
                <input type="number" min="1" step="0.01" value={quotaLimitGib} onChange={e => setQuotaLimitGib(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-hidden focus:border-accent" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-light text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Guardando..." : "Guardar Identidad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
