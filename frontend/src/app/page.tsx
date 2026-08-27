import Link from 'next/link';
import { Play, Database, Cloud, Shield, ArrowRight, Zap, Layers } from 'lucide-react';
import * as motion from "framer-motion/client";

export default function LandingPage() {
  const features = [
    {
      title: "Gemflix Play",
      description: "Tu servidor de cine en casa con reproducción 4K nativa y organización inteligente de metadata cinematográfica.",
      icon: <Play className="w-6 h-6 text-red-500" />,
      color: "bg-red-500/10 border-red-500/20"
    },
    {
      title: "Gemflix Scraper",
      description: "Motor de extracción de datos de alto rendimiento. Obtén información estructurada de la web en milisegundos.",
      icon: <Database className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Gemdrive",
      description: "Almacenamiento infinito. Integración total con Google Drive y SharePoint con velocidades de transferencia sin límite.",
      icon: <Cloud className="w-6 h-6 text-indigo-500" />,
      color: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Gemflix Admin",
      description: "Panel de control centralizado. Gestiona facturación, usuarios, roles y métricas en tiempo real con seguridad JWT.",
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-8 h-8 text-indigo-500" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 tracking-tight">
            Gemflix
          </span>
        </div>
        <Link 
          href="/login" 
          className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-md"
        >
          Acceder <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8"
        >
          <Zap className="w-4 h-4" />
          <span>La Suite de Herramientas Definitiva</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white max-w-4xl"
        >
          Un ecosistema diseñado para <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">romper los límites</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12"
        >
          Plataforma modular de alto rendimiento. Centraliza tu entretenimiento, automatiza extracciones de datos y despliega nubes infinitas con Gemdrive.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] flex items-center justify-center gap-2"
          >
            Entrar al Hub
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-all flex items-center justify-center"
          >
            Explorar Herramientas
          </a>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas, en un solo lugar</h2>
          <p className="text-slate-400">Arquitectura multi-tenant con seguridad JWT y enrutamiento dinámico.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-8 rounded-3xl border bg-black/40 backdrop-blur-sm transition-all hover:bg-white/5 ${feature.color}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500 relative z-10 mt-12">
        <p>© 2026 Gemflix Suite. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
