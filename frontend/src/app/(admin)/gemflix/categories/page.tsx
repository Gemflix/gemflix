"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { CategoriesTable, Category } from "@/components/admin/gemflix/categories/CategoriesTable";
import { CategoryFormModal } from "@/components/admin/gemflix/categories/CategoryFormModal";
import { apiFetch, getApiUrl } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const { data, isLoading, mutate } = useApi('/admin/categories');
  const categories = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingCategory 
        ? `${getApiUrl()}/api/admin/categories/${editingCategory.id}` 
        : `${getApiUrl()}/api/admin/categories`;
      
      const method = editingCategory ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error en la solicitud");
      }
      
      toast.success(editingCategory ? "Categoría actualizada" : "Categoría creada");
      mutate();
      handleCloseModal();
    } catch (error) {
      toast.error('Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías (Carruseles)</h1>
          <p className="text-gray-400 mt-1">
            Diseña los carruseles personalizados que aparecerán en la pantalla de inicio de los usuarios.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <CategoriesTable 
        categories={categories} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        category={editingCategory}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
