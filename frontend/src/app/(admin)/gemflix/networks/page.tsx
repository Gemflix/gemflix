"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { NetworksTable, Network } from "@/components/admin/gemflix/networks/NetworksTable";
import { NetworkFormModal } from "@/components/admin/gemflix/networks/NetworkFormModal";

export default function NetworksPage() {
  const { data, isLoading, mutate } = useApi('/admin/networks');
  const networks = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (network?: Network) => {
    setEditingNetwork(network || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNetwork(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando red:', formData);
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
          <h1 className="text-2xl font-bold text-white">Productoras y Redes</h1>
          <p className="text-gray-400 mt-1">
            Filtra y agrupa el contenido por productoras (Netflix, HBO, Disney+).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Productora</span>
        </button>
      </div>

      <NetworksTable 
        networks={networks} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <NetworkFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        network={editingNetwork}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
