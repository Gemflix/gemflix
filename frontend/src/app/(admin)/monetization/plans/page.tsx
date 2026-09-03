"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { PlansTable, VIPPlan } from "@/components/admin/global/monetization/plans/PlansTable";
import { PlanFormModal } from "@/components/admin/global/monetization/plans/PlanFormModal";
import { apiFetch, getApiUrl } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function PlansPage() {
  const { data, isLoading, mutate } = useApi('/admin/plans');
  const plans = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VIPPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (plan?: VIPPlan) => {
    setEditingPlan(plan || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingPlan 
        ? `${getApiUrl()}/api/admin/plans/${editingPlan.id}` 
        : `${getApiUrl()}/api/admin/plans`;
      
      const method = editingPlan ? "PUT" : "POST";
      
      // Ensure integers are parsed
      formData.max_profiles = parseInt(formData.max_profiles, 10);
      formData.max_devices = parseInt(formData.max_devices, 10);

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error en la solicitud");
      }
      
      toast.success(editingPlan ? "Plan actualizado" : "Plan creado");
      mutate();
      handleCloseModal();
    } catch (error) {
      toast.error('Error al guardar el plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Planes VIP</h1>
          <p className="text-gray-400 mt-1">
            Configura los paquetes de suscripción. Los usuarios VIP no ven anuncios y tienen prioridad de streaming.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nuevo Plan</span>
        </button>
      </div>

      <PlansTable 
        plans={plans} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <PlanFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        plan={editingPlan}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
