"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RelationCrudModal from "@/components/admin/modals/RelationCrudModal";

export default function GenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch("/api/admin/genres", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setGenres(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este género?")) return;
    try {
      const res = await fetch(`/api/admin/genres/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchGenres();
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
          <h1 className="text-3xl font-bold text-white mb-2">Géneros</h1>
          <p className="text-gray-400">Gestiona los géneros para clasificar películas y series.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setModalMode("create"); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo género
        </button>
      </div>

      <div className="bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar género..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Imagen</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre Español</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre Inglés</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : genres.map((genre) => (
                <tr key={genre.id} className="hover:bg-white/2 transition-colors group">
                  <td className="py-4 px-6 text-sm text-gray-400">#{genre.id}</td>
                  <td className="py-4 px-6">
                    {genre.image_path ? (
                      <img src={genre.image_path.startsWith('/') ? genre.image_path : `https://image.tmdb.org/t/p/w300${genre.image_path}`} className="h-10 object-cover rounded" alt="Poster" />
                    ) : (
                      <div className="h-10 w-20 bg-white/5 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">{genre.name_esp || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-400 font-medium">{genre.name_eng || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingItem(genre); setModalMode("edit"); }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(genre.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && genres.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No hay géneros registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <RelationCrudModal
          type="genres"
          mode={modalMode}
          item={editingItem}
          onClose={() => setModalMode(null)}
          onSaved={() => {
            setModalMode(null);
            fetchGenres();
          }}
        />
      )}
    </div>
  );
}

