"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Loader2, X, Users, Globe, Film } from "lucide-react";

interface RelationSelectorProps {
  type: "genres" | "networks" | "casts" | "collections" | "countries";
  mediaType: "movies" | "series";
  mediaId: number;
  onAdded: () => void;
  disabled?: boolean;
  existingIds?: number[];
}

export default function RelationSelector({ type, mediaType, mediaId, onAdded, disabled, existingIds = [] }: RelationSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search/${type}?q=${encodeURIComponent(query)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setResults(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, type, isOpen]);

  const handleAdd = async (relationId: number) => {
    if (disabled) return;
    try {
      const res = await fetch(`/api/admin/${mediaType}/${mediaId}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relation_id: relationId }),
        credentials: "include"
      });
      if (res.ok) {
        setQuery("");
        setIsOpen(false);
        onAdded();
      } else {
        alert("Error vinculando relación.");
      }
    } catch (e) {
      alert("Error al vincular.");
    }
  };

  const getLabel = (item: any) => {
    if (type === "casts") return item.name;
    if (type === "collections") return item.original_name;
    if (type === "genres") return item.name_esp || item.name_eng; 
    if (type === "countries") return item.name;
    return item.name; // Networks
  };

  const renderImage = (item: any) => {
    const tmdbImageBase = "https://image.tmdb.org/t/p/w185";
    
    if (type === "casts") {
      return item.profile_path ? (
        <img src={`${tmdbImageBase}${item.profile_path}`} className="w-16 h-16 rounded-full object-cover shadow-md border border-white/10" alt={item.name} />
      ) : (
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
          <Users className="w-6 h-6 text-white/30" />
        </div>
      );
    }
    
    if (type === "networks") {
      return item.logo_path ? (
        <div className="bg-white/10 p-2 rounded-lg w-full h-12 flex items-center justify-center border border-white/10">
          <img src={item.logo_path?.startsWith('http') ? item.logo_path : `${tmdbImageBase}${item.logo_path?.startsWith('/') ? '' : '/'}${item.logo_path}`} className="max-w-full max-h-full object-contain" alt={item.name} />
        </div>
      ) : (
        <div className="w-full h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
          <Globe className="w-6 h-6 text-white/30" />
        </div>
      );
    }

    if (type === "collections") {
      return item.poster_path ? (
        <img src={`${tmdbImageBase}${item.poster_path}`} className="w-12 h-16 rounded-md object-cover shadow-md border border-white/10" alt={item.original_name} />
      ) : (
        <div className="w-12 h-16 bg-white/10 rounded-md flex items-center justify-center border border-white/10">
          <Film className="w-6 h-6 text-white/30" />
        </div>
      );
    }

    // Default icon for genres and countries
    return (
      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
        <Globe className="w-6 h-6 text-white/30" />
      </div>
    );
  };

  const typeLabelMap: Record<string, string> = {
    casts: "Actor",
    genres: "Género",
    networks: "Plataforma",
    collections: "Colección",
    countries: "País",
  };

  const buttonLabel = `Añadir ${typeLabelMap[type] || ''}`;

  const filteredResults = results.filter(item => !existingIds.includes(item.id));

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 hover:bg-(--accent)/20 text-accent rounded-lg transition-colors text-sm font-bold border border-(--accent)/20 disabled:opacity-50"
      >
        <Plus className="w-4 h-4" /> {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-accent" />
                Buscar y {buttonLabel}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input */}
            <div className="p-6 border-b border-white/5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Escribe el nombre del ${typeLabelMap[type].toLowerCase()}...`}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-500"
                />
                <Search className="w-6 h-6 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p>Buscando...</p>
                </div>
              ) : query.length < 2 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Search className="w-12 h-12 mb-3 opacity-20" />
                  <p>Escribe al menos 2 caracteres para buscar</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className={`grid gap-4 ${type === 'casts' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
                  {filteredResults.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleAdd(item.id)}
                      className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-accent/50 cursor-pointer transition-all flex flex-col items-center text-center gap-3 relative overflow-hidden"
                    >
                      {renderImage(item)}
                      <div>
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white line-clamp-2">
                          {getLabel(item)}
                        </span>
                        {type === 'casts' && item.known_for_department && (
                          <span className="text-xs text-gray-500 mt-1 block">{item.known_for_department}</span>
                        )}
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-(--accent)/20 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                        <div className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <Plus className="w-4 h-4" /> Añadir
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Globe className="w-12 h-12 mb-3 opacity-20" />
                  <p>{results.length > 0 ? "Todos los resultados ya están añadidos." : "No se encontraron resultados"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

