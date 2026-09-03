"use client";

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  options: any;
  onReady?: (player: Player) => void;
  isVip?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady, isVip = false }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      
      // Añadimos clases base para estilizarlo con Tailwind luego
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-gemflix-skin');

      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        if (onReady) {
          onReady(player);
        }
      }));

      // SIMULACIÓN VIP: Lógica condicional de Anuncios
      if (!isVip) {
        console.log("Usuario Gratis: Preparando infraestructura de Anuncios (VAST) futuro.");
        // Aquí en el futuro inyectaremos los plugins de publicidad
      } else {
        console.log("Usuario VIP: Reproductor libre de anuncios activado.");
      }
    } else {
      // Update player options if they change
      const player = playerRef.current;
      if (player) {
        player.autoplay(options.autoplay);
        player.src(options.sources);
      }
    }
  }, [options, videoRef, onReady, isVip]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      data-vjs-player 
      ref={videoRef} 
      className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl shadow-2xl" 
    />
  );
};
