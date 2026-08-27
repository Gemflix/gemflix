import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Play, Database, Cloud, Shield, LogOut, LayoutGrid, MonitorPlay } from 'lucide-react';
import * as motion from "framer-motion/client";

export default async function HubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  const role = cookieStore.get('gemflix_staff_role')?.value;

  // Si no hay token, redirigir al login
  if (!token) {
    redirect('/login');
  }

  const isStaff = role && role !== 'user';

  const apps = [
    {
      title: "Gemflix Play",
      description: "Servidor Multimedia",
      icon: <Play className="w-8 h-8 text-red-500" />,
      url: "https://play.gemflix.org",
      color: "bg-red-500/10 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20"
    },
    {
      title: "Jellyfin",
      description: "Reproductor Nativo",
      icon: <MonitorPlay className="w-8 h-8 text-purple-500" />,
      url: "https://jellyfin.gemflix.org",
      color: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20"
    },
    {
      title: "Gemflix Scraper",
      description: "Extracción de Datos",
      icon: <Database className="w-8 h-8 text-blue-500" />,
      url: "https://scraper.gemflix.org",
      color: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20"
    },
    {
      title: "Gemdrive",
      description: "Nube de Descargas",
      icon: <Cloud className="w-8 h-8 text-indigo-500" />,
      url: "https://drive.gemflix.org",
      color: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/20"
    }
  ];

  // Removed Admin Panel from Hub to keep it isolated and secure

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold text-white tracking-tight">Hub de Aplicaciones</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Sesión activa {isStaff && <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">STAFF</span>}
            </div>
            {/* Formulario simple para logout usando el endpoint del API */}
            <form action="/api/auth/logout" method="POST">
              <button 
                type="submit"
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido a Gemflix Suite</h1>
          <p className="text-slate-400">Selecciona una herramienta para comenzar a trabajar.</p>
        </motion.div>

        {/* Bento Grid Apps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, idx) => (
            <motion.a
              key={app.title}
              href={app.url}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border bg-black/40 backdrop-blur-sm transition-all flex flex-col items-center text-center group cursor-pointer shadow-lg ${app.color}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {app.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{app.title}</h2>
              <p className="text-sm text-slate-400">{app.description}</p>
            </motion.a>
          ))}
        </div>
      </main>
    </div>
  );
}
