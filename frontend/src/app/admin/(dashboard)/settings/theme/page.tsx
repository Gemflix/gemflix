"use client";

import { useState, useEffect } from "react";
import { Upload, Palette, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ThemeSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#f97316");
  const [backgroundColor, setBackgroundColor] = useState("#0f1115");
  const [borderRadius, setBorderRadius] = useState("0.5rem");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.theme_config) {
          try {
            const config = JSON.parse(data.theme_config);
            if (config.primaryColor) setPrimaryColor(config.primaryColor);
            if (config.backgroundColor) setBackgroundColor(config.backgroundColor);
            if (config.borderRadius) setBorderRadius(config.borderRadius);
            if (config.logoUrl) setLogoPreview(config.logoUrl);
          } catch (e) {
            console.error("Error parsing theme config", e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/settings/logo", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setLogoPreview(data.url);
      } else {
        alert("Error al subir el logo");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const themeConfig = JSON.stringify({
      primaryColor,
      backgroundColor,
      borderRadius,
      logoUrl: logoPreview
    });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "theme_config", value: themeConfig }),
        credentials: "include"
      });
      if (res.ok) {
        alert("Tema guardado exitosamente");
      } else {
        alert("Error al guardar");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Apariencia y Tema Global</h1>
        <p className="text-gray-400">Configura el diseño y los colores por defecto que verán los usuarios en la plataforma pública (Play).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" /> Editor de Tema
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Logo Principal</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:bg-white/5 transition-colors relative cursor-pointer group">
              <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {logoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={logoPreview} alt="Logo" className="max-h-16 object-contain" />
                  <span className="text-xs text-gray-400 group-hover:text-white">Clic para cambiar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Subir PNG, SVG o JPEG</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Recomendado: SVG o PNG con fondo transparente, optimizado para fondos oscuros.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Primario (Accent)</label>
              <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-lg p-2">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-white font-mono text-sm uppercase">{primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color de Fondo</label>
              <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-lg p-2">
                <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-white font-mono text-sm uppercase">{backgroundColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Redondeo de Bordes (UI)</label>
            <select value={borderRadius} onChange={e => setBorderRadius(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
              <option value="0px">Cuadrado (Sharp)</option>
              <option value="0.5rem">Ligeramente Redondeado (0.5rem)</option>
              <option value="1rem">Muy Redondeado (1rem)</option>
              <option value="9999px">Píldora (Pill)</option>
            </select>
          </div>

          <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-4">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Guardar Tema Global
          </button>
        </div>

        {/* Live Preview */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Vista Previa Dinámica</h2>
          <div 
            className="rounded-2xl border border-white/20 overflow-hidden shadow-2xl transition-colors duration-300 relative"
            style={{ backgroundColor: backgroundColor }}
          >
            {/* Fake NavBar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-6" />
              ) : (
                <div className="text-xl font-bold" style={{ color: primaryColor }}>GEMFLIX</div>
              )}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10" />
              </div>
            </div>
            
            {/* Fake Content */}
            <div className="p-6 space-y-6">
              <div 
                className="w-full h-32 flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300"
                style={{ backgroundColor: primaryColor, borderRadius: borderRadius }}
              >
                Hero Section
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-video bg-white/5 border border-white/10 shadow-sm" style={{ borderRadius: borderRadius }} />
                ))}
              </div>
              
              <button 
                className="px-6 py-2 text-white font-medium transition-all duration-300 w-fit"
                style={{ backgroundColor: primaryColor, borderRadius: borderRadius }}
              >
                Botón Principal
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center">Esta vista previa es aproximada. Los usuarios finales podrán sobreescribir estos ajustes si activan un tema local en el subdominio Play.</p>
        </div>
      </div>
    </div>
  );
}
