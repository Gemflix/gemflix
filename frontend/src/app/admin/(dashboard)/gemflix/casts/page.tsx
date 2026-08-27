"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RelationCrudModal from "@/components/admin/modals/RelationCrudModal";

export default function CastsPage() {
  const [casts, setCasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const res = await fetch("/api/admin/casts", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setCasts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta persona?")) return;
    try {
      const res = await fetch(`/api/admin/casts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchCasts();
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
          <h1 className="text-3xl font-bold text-white mb-2">Reparto (Actores y Equipo)</h1>
          <p className="text-gray-400">Gestiona los actores, directores y equipo técnico.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setModalMode("create"); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Añadir Persona
        </button>
      </div>

      <div className="bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar persona..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfil</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">TMDB ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : casts.map((cast) => (
                <tr key={cast.id} className="hover:bg-white/2 transition-colors group">
                  <td className="py-4 px-6">
                    {cast.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${cast.profile_path}`} className="h-12 w-12 object-cover rounded-full shadow-md" alt={cast.name} />
                    ) : (
                      <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">{cast.name}</p>
                    {cast.original_name && cast.original_name !== cast.name && (
                      <p className="text-gray-500 text-xs mt-0.5">{cast.original_name}</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-400 font-mono text-sm">{cast.tmdb_id || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingItem(cast); setModalMode("edit"); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cast.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && casts.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay personas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <RelationCrudModal
          type="casts"
          mode={modalMode}
          item={editingItem}
          onClose={() => setModalMode(null)}
          onSaved={() => {
            setModalMode(null);
            fetchCasts();
          }}
        />
      )}
    </div>
  );
}
