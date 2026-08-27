"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RelationCrudModal from "@/components/admin/modals/RelationCrudModal";

export default function NetworksPage() {
  const [networks, setNetworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const res = await fetch("/api/admin/networks", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setNetworks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta red/plataforma?")) return;
    try {
      const res = await fetch(`/api/admin/networks/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchNetworks();
      } else {
        alert("Error al eliminar");
      }
    } catch (e) {
      alert("Error en la conexión");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Redes y Plataformas</h1>
          <p className="text-gray-400">Gestiona plataformas de streaming (Netflix, Crunchyroll, etc.).</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setModalMode("create"); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nueva Plataforma
        </button>
      </div>

      <div className="bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar plataforma..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Media</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : networks.map((net) => (
                <tr key={net.id} className="hover:bg-white/2 transition-colors group">
                  <td className="py-4 px-6 text-sm text-gray-400">#{net.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {net.poster_path ? (
                        <img src={net.poster_path.startsWith('http') ? net.poster_path : `https://image.tmdb.org/t/p/w92${net.poster_path.startsWith('/') ? '' : '/'}${net.poster_path}`} className="h-10 object-contain bg-white/10 rounded p-1" alt="Poster" />
                      ) : (
                        <div className="h-10 w-8 bg-white/5 rounded flex items-center justify-center text-[10px] text-gray-500">P</div>
                      )}
                      {net.backdrop_path ? (
                        <img src={net.backdrop_path.startsWith('http') ? net.backdrop_path : `https://image.tmdb.org/t/p/w300${net.backdrop_path.startsWith('/') ? '' : '/'}${net.backdrop_path}`} className="h-10 object-cover bg-white/10 rounded p-1" alt="Backdrop" />
                      ) : (
                        <div className="h-10 w-16 bg-white/5 rounded flex items-center justify-center text-[10px] text-gray-500">B</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">{net.name || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingItem(net); setModalMode("edit"); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(net.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && networks.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay plataformas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <RelationCrudModal
          type="networks"
          mode={modalMode}
          item={editingItem}
          onClose={() => setModalMode(null)}
          onSaved={() => {
            setModalMode(null);
            fetchNetworks();
          }}
        />
      )}
    </div>
  );
}
