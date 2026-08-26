"use client";

import { useState, useEffect } from "react";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/community/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/community/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, media_type: type, tmdb_id: 0, notes: "" })
      });
      if (res.ok) {
        setTitle("");
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Peticiones</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Pedir una Película o Serie</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la obra..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
            required
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="movie">Película</option>
            <option value="serie">Serie</option>
            <option value="anime">Anime</option>
          </select>
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Enviar
          </button>
        </div>
      </form>

      <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 bg-gray-900/50 border-b border-gray-800 font-bold text-gray-400 grid grid-cols-3">
          <div>Título</div>
          <div>Tipo</div>
          <div>Estado</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tienes peticiones activas.</div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="p-4 border-b border-gray-800/50 grid grid-cols-3 items-center hover:bg-gray-800/30">
              <div className="text-white font-medium">{req.title}</div>
              <div className="text-gray-400 uppercase text-xs">{req.media_type}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  req.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                  req.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
