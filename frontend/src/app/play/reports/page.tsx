"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/community/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Mis Reportes</h1>
      
      <div className="bg-[#111] p-6 rounded-xl border border-gray-800 mb-8">
        <p className="text-gray-400">
          Esta página muestra los enlaces caídos o problemas que has reportado. Para reportar un problema, hazlo directamente desde el reproductor o la página del contenido.
        </p>
      </div>

      <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 bg-gray-900/50 border-b border-gray-800 font-bold text-gray-400 grid grid-cols-4">
          <div>ID Contenido</div>
          <div>Tipo</div>
          <div>Razón</div>
          <div>Estado</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tienes reportes activos.</div>
        ) : (
          reports.map((rep: any) => (
            <div key={rep.id} className="p-4 border-b border-gray-800/50 grid grid-cols-4 items-center hover:bg-gray-800/30">
              <div className="text-white font-medium">#{rep.media_id}</div>
              <div className="text-gray-400 uppercase text-xs">{rep.media_type}</div>
              <div className="text-gray-300 text-sm">{rep.reason}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  rep.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  rep.status === 'investigating' ? 'bg-blue-500/20 text-blue-500' :
                  rep.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {rep.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
