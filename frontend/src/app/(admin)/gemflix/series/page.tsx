"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { SeriesTable, Serie } from "@/components/admin/gemflix/series/SeriesTable";
import { SerieFormModal } from "@/components/admin/gemflix/series/SerieFormModal";

export default function SeriesPage() {
  // Obtenemos los datos con nuestro hook de API (SWR)
  const { data, isLoading, mutate } = useApi('/admin/series');
  const series = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSerie, setEditingSerie] = useState<Serie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (serie?: Serie) => {
    setEditingSerie(serie || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSerie(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando serie:', formData);
      
      // Simulamos la respuesta de la API de Go
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
          <h1 className="text-2xl font-bold text-white">Catálogo de Series</h1>
          <p className="text-gray-400 mt-1">
            Gestiona la biblioteca de series de TV. Agrega el ID y el scraper descargará las temporadas automáticamente.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Serie</span>
        </button>
      </div>

      <SeriesTable 
        series={series} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <SerieFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        serie={editingSerie}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
