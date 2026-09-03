"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { QuotasTable, Quota } from "@/components/admin/gemdrive/quotas/QuotasTable";
import { QuotaFormModal } from "@/components/admin/gemdrive/quotas/QuotaFormModal";

export default function QuotasPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/quotas');
  const quotas = data?.data || [
    { id: 1, replica_name: 'Drive GSuite 1', max_size_gb: 2000, current_size_gb: 1850, warning_threshold: 90, status: 'warning' },
    { id: 2, replica_name: 'SharePoint Media A', max_size_gb: 5000, current_size_gb: 2100, warning_threshold: 85, status: 'ok' },
    { id: 3, replica_name: 'OneDrive Backup', max_size_gb: 1000, current_size_gb: 995, warning_threshold: 85, status: 'full' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState<Quota | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (quota: Quota) => {
    setEditingQuota(quota);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuota(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando cuota:', formData);
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
          <h1 className="text-2xl font-bold text-white">Cuotas y Límites</h1>
          <p className="text-gray-400 mt-1">
            Supervisa el llenado de los nodos de GemDrive para evitar bloqueos por falta de espacio en la nube.
          </p>
        </div>
      </div>

      <QuotasTable 
        quotas={quotas} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <QuotaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        quota={editingQuota}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
