"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { AdsTable, AdCampaign } from "@/components/admin/global/monetization/ads/AdsTable";
import { AdFormModal } from "@/components/admin/global/monetization/ads/AdFormModal";

export default function AdsPage() {
  const { data, isLoading, mutate } = useApi('/admin/monetization/ads');
  const ads = data?.data || [
    { id: 1, name: 'Popunder Adsterra', type: 'popunder', status: 'active', impressions: 45200, clicks: 1205 },
    { id: 2, name: 'Banner Footer 728x90', type: 'banner', status: 'active', impressions: 125000, clicks: 450 },
    { id: 3, name: 'Smartlink CPA', type: 'smartlink', status: 'paused', impressions: 8400, clicks: 8400 }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (ad?: AdCampaign) => {
    setEditingAd(ad || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando ad:', formData);
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
          <h1 className="text-2xl font-bold text-white">Rotador de Anuncios</h1>
          <p className="text-gray-400 mt-1">
            Gestiona banners, popunders y enlaces inteligentes. Mide el rendimiento de cada campaña.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nueva Campaña</span>
        </button>
      </div>

      <AdsTable 
        ads={ads} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <AdFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        ad={editingAd}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
