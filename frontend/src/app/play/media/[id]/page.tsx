"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Clock, Star, ArrowLeft } from "lucide-react";
import { SeasonSelector } from "@/components/play/media/SeasonSelector";

interface MediaDetails {
  id: number;
  original_name: string;
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  poster: string;
  backdrop: string;
  vote_average: number;
  type: string;
}

export default function MediaDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [media, setMedia] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/play/media/${id}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setMedia(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">No encontrado</h1>
        <p className="text-gray-400 mb-8">El contenido que buscas no está disponible o la URL es incorrecta.</p>
        <button 
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans">
      
      {/* BACKDROP CON BLUR PROGRESIVO */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        {media.backdrop ? (
          <Image 
            src={media.backdrop} 
            alt="backdrop" 
            fill 
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-linear-to-b from-gray-900 to-[#050505]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-28 pb-32 min-h-screen flex flex-col justify-center">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-10 w-fit transition-colors"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Volver</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* PÓSTER FLOTANTE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative shrink-0 w-60 md:w-[320px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10"
          >
            {media.poster ? (
              <Image 
                src={media.poster} 
                alt={media.title || media.original_name} 
                fill 
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Sin póster</span>
              </div>
            )}
          </motion.div>

          {/* INFORMACIÓN Y BOTÓN PLAY */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-xl text-balance">
              {media.title || media.original_name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-8 font-medium">
              {media.release_date && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Calendar size={16} className="text-cyan-400" />
                  {media.release_date.split("-")[0]}
                </div>
              )}
              {media.runtime > 0 && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Clock size={16} className="text-yellow-400" />
                  {media.runtime} min
                </div>
              )}
              {media.vote_average > 0 && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Star size={16} className="text-orange-400" />
                  {media.vote_average.toFixed(1)} / 10
                </div>
              )}
              <div className="uppercase tracking-widest text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold">
                {media.type}
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-3xl text-balance">
              {media.overview || "No hay una sinopsis disponible para este título."}
            </p>

            <div className="flex flex-wrap gap-4">
              {/* BOTÓN PLAY MAESTRO */}
              <button 
                onClick={() => router.push(`/watch/${id}`)}
                className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <Play size={24} className="fill-black group-hover:scale-110 transition-transform" />
                Reproducir
              </button>
              
              <button className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white rounded-full font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md border border-white/10">
                ⭐ Añadir a Mi Lista
              </button>
            </div>
          </motion.div>

        </div>
        
        {/* SELECTOR DE TEMPORADAS (Solo para Series) */}
        {media.type === 'tv' && (
          <SeasonSelector serieId={media.id} />
        )}
      </div>
    </div>
  );
}
