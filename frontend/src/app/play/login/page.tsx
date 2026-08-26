"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export default function PlayLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, platform: "web" }),
        credentials: "include", // Importante para recibir cookies cross-domain
      });

      if (res.ok) {
        const data = await res.json();
        console.log("LOGIN DATA:", data);
        if (data.user?.roles?.length > 0 || data.user?.id === 1) {
          document.cookie = `gemflix_staff_role=admin; path=/; max-age=86400; samesite=lax`;
          window.location.href = "http://admin.localhost:3000/";
        } else {
          document.cookie = `gemflix_staff_role=user; path=/; max-age=86400; samesite=lax`;
          // Redirigir usando force refresh para que middleware capture la nueva cookie
          window.location.href = "/";
        }
      } else {
        const data = await res.json();
        setError(data.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Elementos decorativos basados en el tema */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, var(--accent), transparent 50%)`
        }}
      />
      
      <div className="w-full max-w-md p-8 glass-card theme-rounded z-10">
        <div className="text-center mb-8">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
          ) : (
            <h1 className="text-4xl font-black mb-4" style={{ color: "var(--accent)" }}>
              GEMFLIX
            </h1>
          )}
          <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
          <p className="text-gray-400 mt-2">Inicia sesión para continuar viendo.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white transition-colors placeholder:text-gray-600"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-gray-300">Contraseña</label>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white transition-colors placeholder:text-gray-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            ¿Nuevo en Gemflix? <a href="#" className="text-white hover:underline font-medium">Suscríbete ahora</a>
          </p>
        </div>
      </div>
    </div>
  );
}
