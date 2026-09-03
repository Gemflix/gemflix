import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface MediaItem {
  id: number;
  title: string;
  slug: string;
  poster: string;
}

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  rowType?: 'episodes' | 'continue' | 'posters';
}

export function MediaRow({ title, items, rowType = 'posters' }: MediaRowProps) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  const isLandscape = rowType === 'episodes' || rowType === 'continue';
  const aspectRatioClass = isLandscape ? 'aspect-video' : 'aspect-[2/3]';
  const widthClass = isLandscape ? 'w-[280px] md:w-[320px]' : 'w-[140px] md:w-[200px]';

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 px-4 md:px-12 text-white/90">
        {title}
      </h2>
      
      {/* Scrollable Container */}
      <div className="relative px-4 md:px-12">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {items.map((item, idx) => (
            <motion.div
              key={item.id + '-' + idx}
              onClick={() => router.push(`/media/${item.slug}`)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex-none ${widthClass} relative group cursor-pointer snap-start rounded-md overflow-hidden bg-white/5 border border-white/10`}
            >
              <div className={`${aspectRatioClass} w-full relative`}>
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center p-4 text-center text-gray-500 border border-white/5">
                    <div className="w-10 h-10 mb-2 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-xl">🎬</span>
                    </div>
                    <span className="text-xs font-medium line-clamp-3">{item.title}</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform scale-90 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-6 h-6 fill-white text-white ml-1 shadow-sm" />
                  </div>
                </div>
              </div>
              
              {/* Info section for episodes/continue */}
              {isLandscape && (
                <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black via-black/80 to-transparent">
                  <h3 className="text-sm font-semibold truncate text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  {rowType === 'continue' && (
                    <div className="w-full h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
                      {/* TODO: use percentage when available, mock 50% for now */}
                      <div className="h-full bg-accent w-1/2"></div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
