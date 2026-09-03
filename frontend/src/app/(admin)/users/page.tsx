"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { UsersTable, GemflixUser } from "@/components/admin/global/users/UsersTable";
import { UserFormModal } from "@/components/admin/global/users/UserFormModal";

export default function UsersPage() {
  // Obtenemos los datos con nuestro hook de API (SWR)
  const { data, isLoading, mutate } = useApi('/admin/users');
  const users = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GemflixUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (user?: GemflixUser) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando usuario:', formData);
      const endpoint = editingUser ? `/admin/users/${editingUser.id}` : '/admin/users';
      // Mantenemos la simulacin para guardar/editar por ahora, ya que el backend an no implementa PUT/POST para admin users.
      // Cuando el backend est listo: await apiFetch(endpoint, { method: editingUser ? 'PUT' : 'POST', body: JSON.stringify(formData) });
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
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-1">
            Administra la base de clientes, verifica su estado VIP o aplica baneos de seguridad.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <UserPlus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <UsersTable 
        users={users} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        user={editingUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
