"use client";

import React, { useState, useEffect } from "react";
import { Save, Settings2, Shield, Key, Paintbrush, Globe, Server, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/api";

type TabId = "general" | "apis" | "branding" | "security";

interface Tab {
  id: TabId;
  label: string;
  icon: any;
  desc: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data, isLoading: loading } = useApi("/admin/settings");

  useEffect(() => {
    if (data) {
      const settingsMap: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((s: any) => {
          settingsMap[s.key] = s.value;
        });
      }
      setSettings(settingsMap);
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const keys = Object.keys(settings);
      for (const key of keys) {
        await apiFetch("/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: settings[key] }),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: Tab[] = [
    { id: "general", label: "General", icon: Globe, desc: "Información básica del sitio y SEO." },
    { id: "apis", label: "APIs & Servicios", icon: Server, desc: "Conexiones con TMDB, Fanart, y pagos." },
    { id: "branding", label: "Branding (UI)", icon: Paintbrush, desc: "Personaliza colores, logos y visibilidad." },
    { id: "security", label: "Seguridad", icon: Shield, desc: "Protección anti-spam y accesos." },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Settings2 size={24} />
            </div>
            Ajustes del Sistema
          </h1>
          <p className="text-gray-400 mt-2">Configura los parámetros globales de la plataforma Gemflix.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group relative flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400/30 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (saveSuccess ? <Check size={20} className="text-emerald-300" /> : <Save size={20} />)}
          {saveSuccess ? 'Guardado Exitoso!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${isActive
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
              >
                {isActive && <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                <div className={`p-2 rounded-xl border transition-colors ${isActive ? 'bg-blue-500 text-white border-blue-400' : 'bg-black/50 text-gray-400 border-white/10 group-hover:text-gray-200'}`}>
                  <tab.icon size={20} />
                </div>
                <div>
                  <div className={`font-bold tracking-wide transition-colors ${isActive ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                    {tab.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2 pr-2">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/2 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 min-h-125">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >

              {activeTab === "general" && (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Globe className="text-blue-400" /> Información del Sitio</h2>
                    <p className="text-gray-400 mt-1">Configura cómo aparece tu sitio en la web y los motores de búsqueda.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-w-2xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300">Nombre del Sitio</label>
                      <input
                        type="text"
                        value={settings.site_name || ""}
                        onChange={(e) => handleChange("site_name", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 transition-all outline-none"
                        placeholder="Ej: Gemflix"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300">Descripción (SEO)</label>
                      <textarea
                        value={settings.site_description || ""}
                        onChange={(e) => handleChange("site_description", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 transition-all outline-none min-h-24"
                        placeholder="La mejor plataforma de streaming..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300">Palabras Clave (SEO Keywords)</label>
                      <input
                        type="text"
                        value={settings.site_keywords || ""}
                        onChange={(e) => handleChange("site_keywords", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 transition-all outline-none"
                        placeholder="peliculas, series, streaming..."
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "apis" && (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Server className="text-blue-400" /> Claves de API Externas</h2>
                    <p className="text-gray-400 mt-1">Integra servicios externos para metadata y funciones avanzadas.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-w-2xl">
                    <div className="space-y-2 relative group">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">TMDB API Key <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase border border-blue-500/30">v3 auth</span></label>
                      <div className="relative">
                        <input
                          type="password"
                          value={settings.tmdb_api_key || ""}
                          onChange={(e) => handleChange("tmdb_api_key", e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-blue-500 focus:ring-1 transition-all outline-none"
                        />
                        <Key size={18} className="absolute left-4 top-3.5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Usada para la importación automática de metadatos de películas.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300">Fanart.tv API Key</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={settings.fanart_api_key || ""}
                          onChange={(e) => handleChange("fanart_api_key", e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-blue-500 focus:ring-1 transition-all outline-none"
                        />
                        <Key size={18} className="absolute left-4 top-3.5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Provee imágenes de alta calidad (Logos, fondos limpios).</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "branding" && (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Paintbrush className="text-blue-400" /> Branding & UI</h2>
                    <p className="text-gray-400 mt-1">Ajusta los colores y la experiencia de usuario pública.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-300 block">Color Principal</label>
                        <div className="flex gap-3 items-center">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg cursor-pointer">
                            <input
                              type="color"
                              value={settings.primary_color || "#3b82f6"}
                              onChange={(e) => handleChange("primary_color", e.target.value)}
                              className="absolute -inset-4 w-[150%] h-[150%] cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={settings.primary_color || "#3b82f6"}
                            onChange={(e) => handleChange("primary_color", e.target.value)}
                            className="w-32 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white uppercase font-mono text-center focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-300 block">Visibilidad del Catálogo</label>
                        <div className="grid grid-cols-1 gap-3">
                          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${settings.public_catalog !== "false" ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
                            <div className="mt-0.5">
                              <input type="radio" name="public_catalog" className="w-4 h-4 text-blue-500 bg-black border-white/20 focus:ring-blue-500 focus:ring-2" checked={settings.public_catalog !== "false"} onChange={() => handleChange("public_catalog", "true")} />
                            </div>
                            <div>
                              <div className={`font-bold ${settings.public_catalog !== "false" ? 'text-blue-400' : 'text-gray-300'}`}>Público</div>
                              <div className="text-xs text-gray-500 mt-1">Los visitantes pueden explorar el catálogo sin iniciar sesión.</div>
                            </div>
                          </label>
                          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${settings.public_catalog === "false" ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
                            <div className="mt-0.5">
                              <input type="radio" name="public_catalog" className="w-4 h-4 text-blue-500 bg-black border-white/20 focus:ring-blue-500 focus:ring-2" checked={settings.public_catalog === "false"} onChange={() => handleChange("public_catalog", "false")} />
                            </div>
                            <div>
                              <div className={`font-bold ${settings.public_catalog === "false" ? 'text-blue-400' : 'text-gray-300'}`}>Privado</div>
                              <div className="text-xs text-gray-500 mt-1">El sitio muestra un login. Requiere cuenta para ver cualquier contenido.</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-blue-400" /> Seguridad & Anti-Spam</h2>
                    <p className="text-gray-400 mt-1">Protege tu plataforma de bots y registros falsos.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 max-w-2xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">Cloudflare Turnstile Site Key</label>
                      <input
                        type="text"
                        value={settings.turnstile_site_key || ""}
                        onChange={(e) => handleChange("turnstile_site_key", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 transition-all outline-none font-mono text-sm"
                        placeholder="1x00000000000000000000AA"
                      />
                      <p className="text-xs text-gray-500 mt-1">Llave pública para habilitar el captcha invisible en Login y Registro.</p>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-4 cursor-pointer group bg-black/30 p-5 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                        <div className={`relative w-12 h-6 transition-colors rounded-full shrink-0 ${settings.require_email_verification === "true" ? 'bg-blue-500' : 'bg-gray-600'}`}>
                          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.require_email_verification === "true" ? 'translate-x-6' : ''}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.require_email_verification === "true"} onChange={(e) => handleChange("require_email_verification", e.target.checked ? "true" : "false")} />
                        <div>
                          <div className={`font-bold ${settings.require_email_verification === "true" ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>Requerir Verificación de Email</div>
                          <div className="text-sm text-gray-500 mt-0.5 leading-snug">Los usuarios nuevos deben confirmar su correo electrónico antes de poder ver contenido o comprar planes.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}