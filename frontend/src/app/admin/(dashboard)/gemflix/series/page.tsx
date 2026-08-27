"use client";

import { useState, useEffect } from "react";
import { MonitorPlay, MoreVertical, Plus, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Switch = ({ checked, onChange, disabled, className = "", size = "normal" }: any) => {
  const isSmall = size === "small";
  return (
    <button 
      type="button" 
      disabled={disabled}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(!checked); }} 
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-white/20'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isSmall ? 'h-5 w-9' : 'h-6 w-11'} ${className}`}
    >
      <span className={`inline-block transform rounded-full bg-white transition-transform ${isSmall ? 'h-3 w-3' : 'h-4 w-4'} ${checked ? (isSmall ? 'translate-x-5' : 'translate-x-6') : 'translate-x-1'}`} />
    </button>
  );
};

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/admin/series", { credentials: "include" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Error HTTP " + res.status);
      }
      const data = await res.json();
      setSeries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [router]);

  const handleTMDBSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/tmdb/search?type=tv&query=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("TMDB error:", errorText);
        alert("Error de API: " + errorText);
        return;
      }
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Error searching TMDB:", error);
      alert("Error buscando en TMDB");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportSerie = async (tmdbId: number) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id: tmdbId, type: "serie", status: "Publicado" }),
        credentials: "include"
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchSeries(); // recargar
      } else {
        const errData = await res.text();
        alert("Error al importar la serie: " + errData);
      }
    } catch (error) {
      console.error("Error importing serie", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAttr = async (id: number, field: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setSeries(prev => prev.map(s => s.id === id ? { ...s, [field]: newValue } : s));
    try {
      const res = await fetch(`/api/admin/series/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
        credentials: "include"
      });
      if (!res.ok) setSeries(prev => prev.map(s => s.id === id ? { ...s, [field]: currentValue } : s));
    } catch (e) {
      setSeries(prev => prev.map(s => s.id === id ? { ...s, [field]: currentValue } : s));
    }
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const newStatus = currentActive ? "Borrador" : "Publicado";
    setSeries(prev => prev.map(s => s.id === id ? { ...s, active: !currentActive } : s));
    try {
      const res = await fetch(`/api/admin/series/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include"
      });
      if (!res.ok) setSeries(prev => prev.map(s => s.id === id ? { ...s, active: currentActive } : s));
    } catch (e) {
      setSeries(prev => prev.map(s => s.id === id ? { ...s, active: currentActive } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Catálogo de Series</h1>
          <p className="text-gray-400">Administra las series importadas desde TMDB.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Importar de TMDB</span>
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1c23] border border-surface-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-surface-border flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search size={20} className="text-accent" />
                Buscar en TMDB (Series)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <form onSubmit={handleTMDBSearch} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-accent text-white"
                  placeholder="Ej: Breaking Bad, Game of Thrones..."
                />
                <button 
                  type="submit"
                  disabled={isSearching || !searchQuery}
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 size={20} className="animate-spin" /> : "Buscar"}
                </button>
              </form>

              {/* Resultados */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Resultados</h4>
                  <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {searchResults.map((serie) => (
                      <div key={serie.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        {serie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${serie.poster_path}`} 
                            alt={serie.name} 
                            className="w-16 h-24 object-cover rounded shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-black/40 rounded flex items-center justify-center text-xs text-gray-500">Sin imagen</div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-white text-lg">{serie.name || serie.original_name}</h5>
                            <div className="text-sm text-accent-light mb-1">
                              {serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'N/A'} • ★ {serie.vote_average?.toFixed(1)}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">{serie.overview}</p>
                          </div>
                          <div className="mt-2 text-right">
                            <button 
                              onClick={() => handleImportSerie(serie.id)}
                              disabled={isSaving}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                            >
                              {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Importar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-light rounded-lg">
            <MonitorPlay size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Todas las Series</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-border rounded-lg w-full"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border text-gray-400">
                  <th className="pb-4 font-medium">Título</th>
                  <th className="pb-4 font-medium">Fecha Emisión</th>
                  <th className="pb-4 font-medium">Vistas</th>
                  <th className="pb-4 font-medium">Estado</th>
                  <th className="pb-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {series.map((serie, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        {serie.poster_path ? (
                          <img 
                            src={serie.poster_path.startsWith('http') ? serie.poster_path : `https://image.tmdb.org/t/p/w92${serie.poster_path}`} 
                            alt={serie.title} 
                            className="w-10 h-14 object-cover rounded shadow-md border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[10px] text-gray-500 text-center leading-tight px-1">Sin<br/>Img</div>
                        )}
                        <div>
                          <div className="font-medium text-white text-base">{serie.title}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <label className="flex items-center gap-1.5 cursor-pointer group">
                              <Switch size="small" checked={serie.premium} onChange={() => handleToggleAttr(serie.id, "premium", serie.premium)} />
                              <span className={`text-xs font-medium uppercase transition-colors ${serie.premium ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-400'}`}>Premium</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer group">
                              <Switch size="small" checked={serie.premiere} onChange={() => handleToggleAttr(serie.id, "premiere", serie.premiere)} />
                              <span className={`text-xs font-medium uppercase transition-colors ${serie.premiere ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>Estreno</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer group">
                              <Switch size="small" checked={serie.upcoming} onChange={() => handleToggleAttr(serie.id, "upcoming", serie.upcoming)} />
                              <span className={`text-xs font-medium uppercase transition-colors ${serie.upcoming ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`}>Próximo</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">
                      {serie.first_air_date ? new Date(serie.first_air_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 text-gray-300">{serie.views?.toLocaleString() || 0}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={serie.active} onChange={() => handleToggleStatus(serie.id, serie.active)} />
                        <span className={`text-sm font-medium ${serie.active ? 'text-green-400' : 'text-gray-500'}`}>
                          {serie.active ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => router.push(`/admin/gemflix/series/${serie.id}`)} className="px-3 py-1.5 border border-white/10 hover:border-accent hover:bg-accent/10 rounded-lg text-gray-400 hover:text-accent transition-all font-medium text-sm flex items-center gap-2 ml-auto">
                        <Search size={14} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
                {series.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No hay series registradas. ¡Busca en TMDB para comenzar!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
