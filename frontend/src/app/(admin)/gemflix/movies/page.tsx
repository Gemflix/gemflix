"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { MoviesTable, Movie } from "@/components/admin/gemflix/movies/MoviesTable";
import { MovieFormModal } from "@/components/admin/gemflix/movies/MovieFormModal";

export default function MoviesPage() {
  // Obtenemos los datos con nuestro hook de API (SWR)
  const { data, isLoading, mutate } = useApi('/admin/movies');
  const movies = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (movie?: Movie) => {
    setEditingMovie(movie || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Aquí iría el fetch POST/PUT real a la API de Go
      // await fetch(`/api/admin/movies${editingMovie ? `/${editingMovie.id}` : ''}`, { method: editingMovie ? 'PUT' : 'POST', body: JSON.stringify(formData) })
      
      console.log('Guardando película:', formData);
      
      // Simulamos la respuesta de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizamos la caché de SWR para refrescar la tabla
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
          <h1 className="text-2xl font-bold text-white">Catálogo de Películas</h1>
          <p className="text-gray-400 mt-1">
            Gestiona la biblioteca de películas, sincroniza con TMDB y controla su visibilidad.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Película</span>
        </button>
      </div>

      <MoviesTable 
        movies={movies} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <MovieFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        movie={editingMovie}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
