"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Download, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  enable_stream: boolean;
  enable_download: boolean;
}

interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
  episodes: Episode[];
}

interface SeasonSelectorProps {
  serieId: number;
}

export function SeasonSelector({ serieId }: SeasonSelectorProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/play/media/series/${serieId}/seasons`);
        if (res.ok) {
          const data = await res.json();
          setSeasons(data);
          if (data.length > 0) {
            setSelectedSeasonId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching seasons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, [serieId]);

  if (loading) {
    return (
      <div className="w-full mt-16 animate-pulse">
        <div className="h-12 w-48 bg-white/10 rounded-lg mb-8" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (seasons.length === 0) {
    return null; // No seasons available
  }

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId);

  return (
    <div className="w-full mt-16 pb-24">
      {/* HEADER TABS / SELECTOR */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Episodios</h2>
        
        <select 
          className="bg-[#18181B] text-white border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-cyan-500 transition-colors font-medium cursor-pointer"
          value={selectedSeasonId || ""}
          onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
        >
          {seasons.map(season => (
            <option key={season.id} value={season.id}>
              {season.name || `Temporada ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>

      {/* EPISODE LIST (Vertical Style) */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {selectedSeason && selectedSeason.episodes.length > 0 ? (
            <motion.div
              key={selectedSeason.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              {selectedSeason.episodes.map((episode, index) => (
                <div 
                  key={episode.id}
                  onClick={() => {
                    if (episode.enable_stream) {
                      router.push(`/watch/${serieId}?season=${selectedSeason.season_number}&ep=${episode.episode_number}`);
                    }
                  }}
                  className={`group relative flex flex-col md:flex-row gap-4 md:gap-6 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 ${episode.enable_stream ? 'cursor-pointer hover:border-white/20' : 'opacity-75 cursor-not-allowed'}`}
                >
                  
                  {/* NUMERACIÓN (ESTILO NETFLIX) */}
                  <div className="hidden md:flex items-center justify-center w-12 text-2xl font-bold text-gray-500 group-hover:text-white transition-colors">
                    {episode.episode_number}
                  </div>

                  {/* THUMBNAIL */}
                  <div className="relative shrink-0 w-full md:w-64 aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                    {episode.still_path ? (
                      <Image 
                        src={episode.still_path.startsWith('http') ? episode.still_path : `https://image.tmdb.org/t/p/w500${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                        No Image
                      </div>
                    )}

                    {/* OVERLAY ICON */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      {episode.enable_stream ? (
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/20 group-hover:border-white group-hover:bg-cyan-600/80 transition-all duration-300">
                          <Play size={20} className="fill-white translate-x-[2px]" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-black/80 flex items-center justify-center border border-white/10">
                          <Lock size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        <span className="md:hidden mr-2 text-gray-400">{episode.episode_number}.</span>
                        {episode.name}
                      </h3>
                      <span className="text-sm font-medium text-gray-400 bg-black/50 px-2 py-1 rounded-md">
                        {episode.air_date ? episode.air_date.split('-')[0] : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                      {episode.overview || "No hay descripción disponible para este episodio."}
                    </p>
                  </div>
                  
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-gray-400">
              No hay episodios disponibles para esta temporada.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
