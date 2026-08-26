"use client";

import { useState, useTransition } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        await loginAction(formData);
      } catch (err: any) {
        setError(err.message || "Error de inicio de sesión");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Luces decorativas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent rounded-full blur-[120px] opacity-[0.05] pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent tracking-wider mb-2">
            GEMFLIX
          </h1>
          <p className="text-gray-400 text-sm">Panel de Administración Segura</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form action={handleAction} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="email" 
                name="email"
                required
                className="w-full bg-slate-900/50 border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-all duration-300 placeholder:text-gray-600"
                placeholder="admin@gemflix.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                required
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

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : "Iniciar Sesión Segura"}
          </button>
        </form>
      </div>
    </div>
  );
}
