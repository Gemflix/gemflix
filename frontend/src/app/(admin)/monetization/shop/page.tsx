"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiFetch, getApiUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ShopItemsTable, ShopItem } from "@/components/admin/global/monetization/shop/ShopItemsTable";
import { ShopItemFormModal } from "@/components/admin/global/monetization/shop/ShopItemFormModal";

export default function ShopPage() {
  const { data, isLoading, mutate } = useApi('/admin/shop');
  const items = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (item?: ShopItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingItem 
        ? `${getApiUrl()}/api/admin/shop/${editingItem.id}` 
        : `${getApiUrl()}/api/admin/shop`;
      
      const method = editingItem ? "PUT" : "POST";
      
      formData.price = parseInt(formData.price, 10);

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error en la solicitud");
      }
      
      toast.success(editingItem ? "Artículo actualizado" : "Artículo creado");
      mutate();
      handleCloseModal();
    } catch (error) {
      toast.error('Error al guardar el artículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tienda (Shop)</h1>
          <p className="text-gray-400 mt-1">
            Gestiona los avatares, marcos y fondos que los usuarios pueden comprar con gemas.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nuevo Artículo</span>
        </button>
      </div>

      <ShopItemsTable 
        items={items} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <ShopItemFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        item={editingItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
