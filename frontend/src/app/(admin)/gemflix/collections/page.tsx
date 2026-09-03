"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { CollectionsTable, Collection } from "@/components/admin/gemflix/collections/CollectionsTable";
import { CollectionFormModal } from "@/components/admin/gemflix/collections/CollectionFormModal";

export default function CollectionsPage() {
  const { data, isLoading, mutate } = useApi('/admin/collections');
  const collections = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (collection?: Collection) => {
    setEditingCollection(collection || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando colección:', formData);
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
          <h1 className="text-2xl font-bold text-white">Colecciones (Sagas)</h1>
          <p className="text-gray-400 mt-1">
            Agrupa películas en sagas (ej. Star Wars Collection, MCU) usando el ID de TMDB.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Colección</span>
        </button>
      </div>

      <CollectionsTable 
        collections={collections} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <CollectionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        collection={editingCollection}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
