import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HeroData {
  title: string;
  slug?: string;
  overview: string;
  backdrop?: string | null;
  poster?: string | null;
}

export function HeroCarousel({ hero, viewMode }: { hero: HeroData, viewMode: string }) {
  const router = useRouter();

  if (!hero) return null;

  const isMovie = viewMode === 'movies';
  const isAnime = viewMode === 'animes';
  const label = isMovie ? 'Película' : (isAnime ? 'Anime' : 'Serie');
  const badgeColor = isMovie 
    ? 'from-emerald-500/90 to-teal-700/90 border-emerald-400/30' 
    : (isAnime ? 'from-pink-500/90 to-rose-700/90 border-pink-400/30' : 'from-sky-500/90 to-blue-700/90 border-sky-400/30');

  const handlePlayClick = () => {
    if (hero.slug) {
      router.push(`/media/${hero.slug}`);
    }
  };

  return (
    <div className="relative w-full h-[60vh] min-h-115 md:h-170 lg:h-180 rounded-3xl overflow-hidden group z-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] bg-[#050505] border border-white/10 ring-1 ring-white/10 select-none">

      <div className="relative w-full h-full">
        {/* Backdrop Image */}
        <div className="absolute inset-0 w-full h-full transition ease-out duration-1000 opacity-100 transform scale-100">
          {hero.backdrop ? (
            <Image 
              src={hero.backdrop} 
              alt={hero.title}
              fill
              className="object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-[#050505]" />
          )}
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-[#050505]/80 to-transparent z-10 w-3/4 lg:w-2/3"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/20 to-transparent z-10 h-1/2 mt-auto"></div>
          <div className="absolute inset-0 bg-black/30 z-10 mix-blend-multiply"></div>
          
          {/* Grain texture overlay (mocked via css) */}
          <div className="absolute inset-0 opacity-[0.03] z-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="w-full px-6 md:px-12 lg:px-20 flex justify-between items-center gap-8">
              
              {/* Left Content */}
              <div className="flex-1 max-w-2xl lg:max-w-3xl transform transition-all duration-700 opacity-100 translate-y-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-5">
                  <span className={`text-white font-black text-[10px] md:text-xs tracking-widest bg-linear-to-r ${badgeColor} px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase shadow-lg border`}>
                    ● {label}
                  </span>
                  <span className="text-amber-400 font-bold text-[10px] md:text-xs bg-amber-500/10 border border-amber-500/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    ✨ DESTACADO
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] tracking-tight line-clamp-2">
                  {hero.title}
                </h2>
                
                {hero.overview && (
                  <p className="hidden sm:block text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 font-medium max-w-2xl drop-shadow-md mt-4">
                    {hero.overview}
                  </p>
                )}
                
                <div className="pt-4 md:pt-6 flex flex-wrap items-center gap-3 md:gap-4">
                  <button onClick={handlePlayClick} className="group/btn relative inline-flex items-center gap-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold py-3.5 px-7 md:py-4 md:px-9 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] border border-blue-400/30 outline-none">
                    <svg className="w-6 h-6 fill-current relative z-10 transition-transform duration-300 group-hover/btn:scale-125" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="uppercase tracking-wider text-sm md:text-base relative z-10">
                        Ver Ahora
                    </span>
                  </button>
                  <button onClick={handlePlayClick} className="inline-flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-bold py-3.5 px-6 md:py-4 md:px-7 rounded-2xl backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm md:text-base">Detalles</span>
                  </button>
                </div>
              </div>

              {/* Right Poster (Desktop Only) */}
              {hero.poster && (
                <div onClick={handlePlayClick} className="hidden lg:block shrink-0 w-64 xl:w-72 relative group/poster z-20 cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 transition-all duration-500 group-hover/poster:scale-105 group-hover/poster:rotate-1">
                    <Image src={hero.poster} alt={hero.title} width={300} height={450} className="w-full h-auto object-cover rounded-2xl" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#050505]/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Ver Ficha Técnica 🍿</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          
          {/* Bottom Ambient Fade */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-[#050505] via-[#050505]/50 to-transparent pointer-events-none z-10"></div>
          
          {/* Indicators (Dummy for now since we only display 1 item) */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <span className="text-xs font-mono font-bold text-white/90">
                  <span>01</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-400">01</span>
              </span>
              <div className="h-3 w-px bg-white/20"></div>
              <div className="flex items-center gap-2">
                  <button className="h-2 rounded-full transition-all duration-500 shadow-md focus:outline-none w-8 bg-linear-to-r from-blue-600 to-blue-400"></button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
