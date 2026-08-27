"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { loginAction } from "@/app/actions/auth";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [error, setError]               = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const [siteKey, setSiteKey]           = useState("");
  const [isPending, startTransition]    = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Obtener la clave de Turnstile desde el servidor en tiempo de ejecución
  // Así no necesitamos variables NEXT_PUBLIC_ de build-time
  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => { if (data.turnstileSiteKey) setSiteKey(data.turnstileSiteKey); })
      .catch(() => {});
  }, []);

  const handleAction = async (formData: FormData) => {
    setError("");

    if (siteKey && !captchaReady) {
      setError("Por favor, espera a que se complete la verificación de seguridad.");
      return;
    }

    if (rememberMe) formData.set("rememberMe", "on");

    startTransition(async () => {
      try {
        const res = await loginAction(formData);
        if (res && "url" in res && res.url) {
          window.location.href = res.url;
        }
      } catch (err: any) {
        setError(err.message || "Error de inicio de sesión");
        // Reiniciar captcha al fallar
        setCaptchaReady(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Luces decorativas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent rounded-full blur-[120px] opacity-[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-700 rounded-full blur-[150px] opacity-[0.03] pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck size={28} className="text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent tracking-wider mb-1">
            GEMFLIX
          </h1>
          <p className="text-gray-400 text-sm">Panel de Administración Segura</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
            {error}
          </div>
        )}

        <form ref={formRef} action={handleAction} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full bg-slate-900/50 border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-all duration-300 placeholder:text-gray-600"
                placeholder="admin@gemflix.org"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                className="w-full bg-slate-900/50 border border-surface-border rounded-xl py-2.5 pl-10 pr-12 text-white focus:outline-none focus:border-accent transition-all duration-300 placeholder:text-gray-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Recordar sesión */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                rememberMe
                  ? "bg-orange-500 border-orange-500"
                  : "border-gray-600 bg-transparent hover:border-gray-400"
              }`}
            >
              {rememberMe && (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-400 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              Recordar sesión por 7 días
            </span>
          </div>

          {/* Turnstile CAPTCHA */}
          {siteKey && (
            <div className="flex justify-center pt-1">
              <Turnstile
                siteKey={siteKey}
                options={{ theme: "dark", language: "es" }}
                onSuccess={() => setCaptchaReady(true)}
                onError={() => { setCaptchaReady(false); setError("Error en la verificación de seguridad."); }}
                onExpire={() => setCaptchaReady(false)}
              />
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={isPending || (!!siteKey && !captchaReady)}
            className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? <><Loader2 size={20} className="animate-spin" /> Verificando...</>
              : "Iniciar Sesión Segura"
            }
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Protegido por Cloudflare Turnstile
        </p>
      </div>
    </div>
  );
}
