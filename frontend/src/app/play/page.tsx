"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Ghost, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HomeTabs } from "@/components/play/home/HomeTabs";
import { HeroCarousel } from "@/components/play/home/HeroCarousel";
import { MediaRow } from "@/components/play/home/MediaRow";

interface MediaItem {
  id: number;
  title: string;
  slug: string;
  poster: string;
}

interface RowData {
  title: string;
  items: MediaItem[];
  row_type?: "episodes" | "continue" | "posters";
}

interface TabData {
  id: string;
  label: string;
}

interface HomeData {
  hero: {
    title: string;
    overview: string;
    backdrop: string;
    poster?: string;
  };
  rows: RowData[];
  tabs: TabData[];
}

export default function PlayPage() {
  const [viewMode, setViewMode] = useState("movies");
  
  const { data, isLoading, isError, mutate } = useApi<HomeData>('/play/home', {
    query: { viewMode }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">

      {/* TABS (Always visible) */}
      <div className="pt-28 max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="mt-2 mb-6 z-10 relative">
          <HomeTabs 
            tabs={data?.tabs || [
              { id: "movies", label: "Películas" },
              { id: "series", label: "Series" },
              { id: "animes", label: "Animes" },
              { id: "novelas", label: "Novelas" },
              { id: "donghuas", label: "Donghua" },
              { id: "doramas", label: "Doramas" },
              { id: "series-lives", label: "Live Action" },
            ]} 
            activeTab={viewMode} 
            onTabChange={setViewMode} 
          />
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Skeleton Hero */}
              <div className="w-full h-[60vh] min-h-115 md:h-170 lg:h-180 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
              
              {/* Skeleton Rows */}
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="mb-8 md:mb-12">
                    <div className="h-8 w-48 bg-white/5 rounded-lg mb-4 ml-4 md:ml-12 animate-pulse" />
                    <div className="flex gap-4 px-4 md:px-12 overflow-hidden">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <div key={j} className="flex-none w-[140px] md:w-[200px] aspect-[2/3] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : isError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Ghost className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">No pudimos conectar con el servidor</h2>
              <p className="text-gray-400 max-w-sm">Parece que los servidores están descansando o tu conexión falló. ¿Lo intentamos de nuevo?</p>
              <button 
                onClick={() => mutate()} 
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium text-white"
              >
                <RefreshCcw size={18} /> Reintentar
              </button>
            </motion.div>
          ) : data ? (
            <motion.div 
              key={`content-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-12">
                <HeroCarousel hero={data.hero} viewMode={viewMode} />
              </div>
              
              <div className="space-y-4 pb-4">
                {data.rows?.map((row, idx) => (
                  <MediaRow 
                    key={idx} 
                    title={row.title} 
                    items={row.items} 
                    rowType={row.row_type} 
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
