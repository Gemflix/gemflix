"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { SourcesTable } from "@/components/admin/gemdrive/sources/SourcesTable";
import { CreateSourceModal } from "@/components/admin/gemdrive/sources/CreateSourceModal";

export default function SourcesPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/sources');
  
  // Mock data for Sources
  const sources = data?.data || [
    { id: 1, name: 'Drive Primario Movies', type: 'google_drive', folder_id: '1aB2cD3eF4gH', sync_status: 'synced', last_sync: new Date().toISOString() },
    { id: 2, name: 'SharePoint Series (Site 1)', type: 'sharepoint', folder_id: 'sp-site-xyz', sync_status: 'syncing', last_sync: new Date(Date.now() - 3600000).toISOString() }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock accounts para el Modal
  const mockAccounts = [
    { id: 1, email: 'admin@gemflix.com', role: 'admin', type: 'service_account', status: 'active', active_sessions: 1, last_login: new Date().toISOString() }
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Modal submit es manejado internamente por el propio modal

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fuentes de Archivos Base (Sources)</h1>
          <p className="text-gray-400 mt-1">
            Mapea las carpetas raíz en Drive o SharePoint de donde GemDrive lee los archivos para clonarlos.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Fuente Base</span>
        </button>
      </div>

      <SourcesTable 
        sources={sources} 
        loading={isLoading} 
      />

      {isModalOpen && (
        <CreateSourceModal
          accounts={mockAccounts as any}
          onClose={handleCloseModal}
          onSuccess={() => { mutate(); handleCloseModal(); }}
        />
      )}
    </div>
  );
}
