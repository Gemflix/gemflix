"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Image as ImageIcon, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [settings, setSettings] = useState({
    siteName: "Gemflix",
    themeMode: "dark",
    maintenanceMode: false,
    registrationEnabled: true,
    publicCatalog: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          publicCatalog: data.public_catalog === "true",
          maintenanceMode: data.maintenance_mode === "true",
          registrationEnabled: data.registration_enabled !== "false", // default true
          siteName: data.site_name || "Gemflix"
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    
    try {
      // Save public catalog
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "public_catalog", value: settings.publicCatalog ? "true" : "false" }),
        credentials: "include"
      });
      // Save others... (we can add parallel fetches if needed)
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site_name", value: settings.siteName }),
        credentials: "include"
      });
      
      setSuccessMsg("Configuración guardada exitosamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuración Global</h1>
          <p className="text-gray-400">Ajusta los parámetros generales del ecosistema y preferencias del sistema.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-8 border-b border-surface-border pb-4">
          <div className="p-2 bg-accent-light rounded-lg">
            <Settings size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Preferencias del Sistema</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Nombre del Sitio</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={e => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tema Predeterminado</label>
              <select 
                value={settings.themeMode}
                onChange={e => setSettings({...settings, themeMode: e.target.value})}
                className="w-full px-4 py-2 bg-[#1a1c23] border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
              >
                <option value="dark">Oscuro (Dark Mode)</option>
                <option value="light">Claro (Light Mode)</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-surface-border">
            <h3 className="text-lg font-medium text-white mb-4">Opciones de Seguridad y Acceso</h3>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.registrationEnabled ? 'bg-accent' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.registrationEnabled ? 'left-7' : 'left-1'}`}></div>
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={settings.registrationEnabled}
                onChange={() => setSettings({...settings, registrationEnabled: !settings.registrationEnabled})}
              />
              <div className="flex flex-col">
                <span className="text-white font-medium group-hover:text-accent transition-colors">Registro Abierto</span>
                <span className="text-xs text-gray-400">Permitir que nuevos usuarios creen cuentas libremente.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group mt-4">
              <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={settings.maintenanceMode}
                onChange={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              />
              <div className="flex flex-col">
                <span className="text-white font-medium group-hover:text-red-400 transition-colors">Modo Mantenimiento</span>
                <span className="text-xs text-gray-400">Restringir el acceso a usuarios normales mientras se actualiza.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group mt-4">
              <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.publicCatalog ? 'bg-green-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.publicCatalog ? 'left-7' : 'left-1'}`}></div>
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={settings.publicCatalog}
                onChange={() => setSettings({...settings, publicCatalog: !settings.publicCatalog})}
              />
              <div className="flex flex-col">
                <span className="text-white font-medium group-hover:text-green-400 transition-colors">Catálogo Público</span>
                <span className="text-xs text-gray-400">Si está activo, cualquiera podrá ver las películas en Play sin iniciar sesión.</span>
              </div>
            </label>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-surface-border">
            <h3 className="text-lg font-medium text-white mb-4">Personalización Visual</h3>
            
            <div className="flex items-center gap-4 p-4 border border-white/5 rounded-xl bg-black/10">
              <div className="w-16 h-16 rounded-lg bg-black/30 flex items-center justify-center border border-dashed border-gray-600">
                <ImageIcon size={24} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Logo del Sistema</p>
                <p className="text-xs text-gray-400 mb-2">Recomendado: PNG o SVG transparente de 256x256.</p>
                <button type="button" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-white">
                  Subir Imagen
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-border flex items-center justify-between">
            {successMsg ? (
              <p className="text-green-400 text-sm font-medium animate-in fade-in">{successMsg}</p>
            ) : (
              <div></div>
            )}
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
