import { useState } from "react";
import { Search, X, PlaySquare, PlayCircle, Plus } from "lucide-react";

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrailer: (youtubeId: string) => void;
  defaultQuery: string;
}

export function YouTubeSearchModal({ isOpen, onClose, onSelectTrailer, defaultQuery }: YouTubeSearchModalProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/youtube/search?q=${encodeURIComponent(query + " trailer español")}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching YouTube");
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      console.error(e);
      alert("Error buscando en YouTube");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1e2028]">
          <div className="flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Buscar Tráiler en YouTube</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Buscar (ej. Avengers trailer español)..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {results.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-4 hover:bg-white/10 transition-colors">
                <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden group">
                  <img src={item.snippet.thumbnails.medium.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  <a href={`https://www.youtube.com/watch?v=${item.id.videoId}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </a>
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="text-white font-medium line-clamp-2">{item.snippet.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.snippet.channelTitle}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">{item.id.videoId}</span>
                    <button 
                      onClick={() => {
                        onSelectTrailer(item.id.videoId);
                        onClose();
                      }}
                      className="bg-white/10 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Seleccionar ID
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && !isSearching && (
              <div className="text-center py-12 text-gray-500">
                <PlaySquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Escribe un término y presiona buscar para ver sugerencias.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
