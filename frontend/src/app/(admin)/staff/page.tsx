"use client";

import { useState } from "react";
import { ShieldPlus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { StaffTable, StaffMember } from "@/components/admin/global/staff/StaffTable";
import { StaffFormModal } from "@/components/admin/global/staff/StaffFormModal";

export default function StaffPage() {
  const { data, isLoading, mutate } = useApi('/admin/staff');
  const staff = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (member?: StaffMember) => {
    setEditingStaff(member || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando staff:', formData);
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
          <h1 className="text-2xl font-bold text-white">Equipo de Trabajo (Staff)</h1>
          <p className="text-gray-400 mt-1">
            Gestiona los administradores y moderadores del panel. Controla quién tiene acceso a la plataforma.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <ShieldPlus size={20} />
          <span>Añadir Staff</span>
        </button>
      </div>

      <StaffTable 
        staff={staff} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <StaffFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        member={editingStaff}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
