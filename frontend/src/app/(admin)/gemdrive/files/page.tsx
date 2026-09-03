"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { FilesTable, GemFile } from "@/components/admin/gemdrive/files/FilesTable";
import { FileFormModal } from "@/components/admin/gemdrive/files/FileFormModal";

export default function FilesPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/files');
  const files = data?.data || [
    { id: 1, filename: 'Deadpool.and.Wolverine.2024.1080p.mp4', tmdb_id: 533535, mime_type: 'video/mp4', size_mb: 2450.5, replicas_count: 3, status: 'ready' },
    { id: 2, filename: 'The.Boys.S04E01.mkv', tmdb_id: 76479, mime_type: 'video/x-matroska', size_mb: 1100.0, replicas_count: 1, status: 'processing' },
    { id: 3, filename: 'Oppenheimer.2023.4K.mp4', tmdb_id: 872585, mime_type: 'video/mp4', size_mb: 8500.0, replicas_count: 0, status: 'missing' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<GemFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (file?: GemFile) => {
    setEditingFile(file || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFile(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando archivo:', formData);
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
          <h1 className="text-2xl font-bold text-white">Archivos Indexados</h1>
          <p className="text-gray-400 mt-1">
            Visualiza todos los archivos multimedia mapeados desde el almacenamiento al catálogo y cuántos clones de respaldo tienen.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Vincular Manual</span>
        </button>
      </div>

      <FilesTable 
        files={files} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <FileFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        file={editingFile}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
