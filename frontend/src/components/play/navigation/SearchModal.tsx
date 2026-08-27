"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: number | string;
  slug: string;
  title: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ movies: SearchResult[], series: SearchResult[] }>({ movies: [], series: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setTimeout(() => {
        setQuery("");
        setResults({ movies: [], series: [] });
      }, 0);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    async function performSearch(q: string) {
      setLoading(true);
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch(`/api/play/catalog/movies?q=${encodeURIComponent(q)}&limit=5`),
          fetch(`/api/play/catalog/series?q=${encodeURIComponent(q)}&limit=5`)
        ]);
        
        const movies = moviesRes.ok ? await moviesRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];
        
        setResults({ movies: movies || [], series: series || [] });
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults({ movies: [], series: [] });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim().length > 0) {
      router.push(`/play/movies?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasResults = results.movies.length > 0 || results.series.length > 0;

  return (
    <div className="fixed inset-0 z-100 flex justify-center items-start pt-[10vh] px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#121418] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-gray-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 px-4 py-4 text-white focus:outline-none focus:ring-0 placeholder-gray-500"
            placeholder="Buscar películas, series, actores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <button onClick={onClose} className="p-1 ml-2 text-gray-500 hover:text-white rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length < 2 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Escribe al menos 2 caracteres para buscar</p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron resultados para &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.movies.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 px-2 tracking-wider">Películas</h3>
                  <div className="space-y-1">
                    {results.movies.map(movie => (
                      <Link 
                        key={movie.id} 
                        href={`/play/movie/${movie.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-10 h-14 bg-gray-900 rounded overflow-hidden shrink-0">
                          {movie.poster_path && (
                            <Image src={movie.poster_path} alt={movie.title} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{movie.title}</p>
                          <p className="text-xs text-gray-500">{movie.release_date?.substring(0,4)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.series.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 px-2 tracking-wider">Series</h3>
                  <div className="space-y-1">
                    {results.series.map(serie => (
                      <Link 
                        key={serie.id} 
                        href={`/play/serie/${serie.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-10 h-14 bg-gray-900 rounded overflow-hidden shrink-0">
                          {serie.poster_path && (
                            <Image src={serie.poster_path} alt={serie.title} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{serie.title}</p>
                          <p className="text-xs text-gray-500">{serie.first_air_date?.substring(0,4)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {hasResults && (
          <div className="p-3 border-t border-gray-800 bg-gray-900/50 text-center">
            <Link 
              href={`/play/movies?q=${encodeURIComponent(query)}`} 
              onClick={onClose}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Ver todos los resultados
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
