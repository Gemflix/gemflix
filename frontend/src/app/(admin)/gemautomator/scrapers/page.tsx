"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ScrapersTable, Scraper } from "@/components/admin/gemautomator/scrapers/ScrapersTable";
import { ScraperFormModal } from "@/components/admin/gemautomator/scrapers/ScraperFormModal";

export default function ScrapersPage() {
  const { data, isLoading, mutate } = useApi('/admin/scrapers');
  const scrapers = data?.data || [
    { id: 1, name: 'TMDB Auto-Updater', target_url: 'https://api.themoviedb.org/3/movie/changes', status: 'running', items_processed: 12450, last_run: new Date().toISOString() },
    { id: 2, name: 'Drive File Scanner', target_url: 'Google Drive API (v3)', status: 'idle', items_processed: 852, last_run: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, name: 'Subtitles Downloader', target_url: 'OpenSubtitles API', status: 'error', items_processed: 0, last_run: undefined }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScraper, setEditingScraper] = useState<Scraper | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (scraper?: Scraper) => {
    setEditingScraper(scraper || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScraper(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando scraper:', formData);
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
          <h1 className="text-2xl font-bold text-white">GemAutomator: Scrapers y APIs</h1>
          <p className="text-gray-400 mt-1">
            Gestiona los motores de recolección de datos que alimentan el catálogo en segundo plano.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nuevo Motor</span>
        </button>
      </div>

      <ScrapersTable 
        scrapers={scrapers} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <ScraperFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        scraper={editingScraper}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
