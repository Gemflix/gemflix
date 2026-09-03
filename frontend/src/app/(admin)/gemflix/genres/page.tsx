"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { GenresTable, Genre } from "@/components/admin/gemflix/genres/GenresTable";
import { GenreFormModal } from "@/components/admin/gemflix/genres/GenreFormModal";

export default function GenresPage() {
  const { data, isLoading, mutate } = useApi('/admin/genres');
  const genres = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (genre?: Genre) => {
    setEditingGenre(genre || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGenre(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando género:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      mutate();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Géneros</h1>
          <p className="text-gray-400 mt-1">
            Administra las categorías de contenido por género (Acción, Comedia, Drama, etc).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Género</span>
        </button>
      </div>

      <GenresTable 
        genres={genres} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <GenreFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        genre={editingGenre}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
