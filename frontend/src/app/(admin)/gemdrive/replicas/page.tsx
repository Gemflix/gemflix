"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ReplicasTable } from "@/components/admin/gemdrive/replicas/ReplicasTable";
import { CreateReplicaModal } from "@/components/admin/gemdrive/replicas/CreateReplicaModal";

export default function ReplicasPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/replicas');
  
  // Mock data for Replicas
  const replicas = data?.data || [
    { id: 1, name: 'Drive GSuite 1', type: 'google_drive', status: 'online', used_storage: 450, total_storage: 2000 },
    { id: 2, name: 'SharePoint Media A', type: 'sharepoint', status: 'online', used_storage: 2100, total_storage: 5000 },
    { id: 3, name: 'OneDrive Backup', type: 'onedrive', status: 'offline', used_storage: 900, total_storage: 1000 }
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
          <h1 className="text-2xl font-bold text-white">Nodos GemReplicas (Servidores)</h1>
          <p className="text-gray-400 mt-1">
            Administra los servidores de almacenamiento en la nube donde se suben los archivos (Google Drive, SharePoint).
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Nodo de Respaldo</span>
        </button>
      </div>

      <ReplicasTable 
        replicas={replicas} 
        loading={isLoading} 
      />

      {isModalOpen && (
        <CreateReplicaModal
          isOpen={isModalOpen}
          accounts={mockAccounts as any}
          onClose={handleCloseModal}
          onSuccess={() => { mutate(); handleCloseModal(); }}
        />
      )}
    </div>
  );
}
