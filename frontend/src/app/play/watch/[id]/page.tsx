"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/play/media/VideoPlayer";
import Player from "video.js/dist/types/player";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // En producción esto vendrá de un endpoint `/api/play/media/${id}/sources`
  const [videoOptions, setVideoOptions] = useState<any>(null);

  // SIMULAMOS que sabemos si el usuario es VIP o no (vendrá de un Context/Cookie)
  const isVipUser = true; // Cambiar a false para probar el modo Gratis

  useEffect(() => {
    // Simulamos un fetch al backend para obtener el link de Drive/Sharepoint/Jellyfin
    const fetchVideoData = async () => {
      // Fake delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setVideoOptions({
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        controlBar: {
          volumePanel: { inline: false }, // Convierte el volumen en un slider horizontal expandible
          remainingTimeDisplay: false,
          pictureInPictureToggle: false,
        },
        // Mock de prueba (video MP4 de código abierto)
        sources: [{
          src: 'https://vjs.zencdn.net/v/oceans.mp4',
          type: 'video/mp4'
        }]
      });
    };

    fetchVideoData();
  }, [id]);

  const handlePlayerReady = (player: Player) => {
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      
      {/* HEADER FLOTANTE (Solo visible al mover el mouse o pausar) */}
      <div className="absolute top-0 left-0 w-full p-6 flex items-center z-50 bg-linear-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-md text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="ml-4">
          <h1 className="text-white font-bold text-xl drop-shadow-md">Reproduciendo Contenido ({id})</h1>
          <p className="text-gray-300 text-sm">Modo: {isVipUser ? 'VIP (Sin Anuncios)' : 'Gratis (Con Anuncios)'}</p>
        </div>
      </div>

      {/* CONTENEDOR DEL REPRODUCTOR */}
      <div className="w-full h-full max-w-[1920px] mx-auto flex items-center justify-center">
        {videoOptions ? (
          <VideoPlayer 
            options={videoOptions} 
            onReady={handlePlayerReady} 
            isVip={isVipUser}
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-cyan-500 animate-spin" />
        )}
      </div>

    </div>
  );
}
