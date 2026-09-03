"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { SharePointTable, SharePointSite } from "@/components/admin/gemdrive/sharepoint/SharePointTable";
import { SharePointFormModal } from "@/components/admin/gemdrive/sharepoint/SharePointFormModal";

export default function SharePointPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/sharepoint');
  const sites = data?.data || [
    { id: 1, account_email: 'admin@gemflix.onmicrosoft.com', site_name: 'Media Node 01', site_id: 'gemflix.sharepoint.com,123,456', drive_id: 'b!abc123def456', status: 'active' },
    { id: 2, account_email: 'backup@gemflix.onmicrosoft.com', site_name: 'Media Backup 01', site_id: 'gemflix.sharepoint.com,789,012', drive_id: 'b!ghi789jkl012', status: 'active' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SharePointSite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (site?: SharePointSite) => {
    setEditingSite(site || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSite(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando sitio:', formData);
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
          <h1 className="text-2xl font-bold text-white">Sitios SharePoint</h1>
          <p className="text-gray-400 mt-1">
            Administra las colecciones de sitios y bibliotecas de documentos (Drives) usando la API de Microsoft Graph.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Vincular Sitio</span>
        </button>
      </div>

      <SharePointTable 
        sites={sites} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <SharePointFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        site={editingSite}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
