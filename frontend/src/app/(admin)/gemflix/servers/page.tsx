"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ServersTable, VideoServer } from "@/components/admin/gemflix/servers/ServersTable";
import { ServerFormModal } from "@/components/admin/gemflix/servers/ServerFormModal";

export default function ServersPage() {
  const { data, isLoading, mutate } = useApi('/admin/servers');
  
  // Mock data
  const servers: VideoServer[] = data?.data || [
    { id: 1, name: 'Nodo Streaming Alpha', type: 'streaming', url: 'https://st1.gemflix.net', capacity_tb: 20, used_tb: 14.5, status: 'active', load_percent: 45 },
    { id: 2, name: 'Storage NAS Central', type: 'storage', url: '10.0.0.50', capacity_tb: 100, used_tb: 85.2, status: 'active', load_percent: 22 },
    { id: 3, name: 'Worker Transcoder 1', type: 'transcoder', url: 'https://tr1.gemflix.net', capacity_tb: 5, used_tb: 1, status: 'maintenance', load_percent: 95 },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<VideoServer | undefined>();

  const handleOpenModal = (server?: VideoServer) => {
    setEditingServer(server);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingServer(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Servidores de Video</h1>
          <p className="text-gray-400 mt-1">
            Gestiona la flota de servidores de streaming, almacenamiento y transcodificación.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Servidor</span>
        </button>
      </div>

      <ServersTable 
        servers={servers} 
        loading={isLoading}
        onEdit={handleOpenModal}
      />

      {isModalOpen && (
        <ServerFormModal
          server={editingServer}
          onClose={handleCloseModal}
          onSuccess={() => { mutate(); handleCloseModal(); }}
        />
      )}
    </div>
  );
}
