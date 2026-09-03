"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { AccountsTable } from "@/components/admin/gemdrive/accounts/AccountsTable";
import { CreateAccountModal } from "@/components/admin/gemdrive/accounts/CreateAccountModal";

export default function AccountsPage() {
  const { data, isLoading, mutate } = useApi('/admin/gemdrive/accounts');
  
  // Mock data to match the expected interface `CloudAccount`
  const accounts = data?.data || [
    { id: 1, email: 'admin@gemflix.com', role: 'admin', type: 'service_account', status: 'active', active_sessions: 1, last_login: new Date().toISOString() },
    { id: 2, email: 'sync@gemflix.com', role: 'system', type: 'service_account', status: 'active', active_sessions: 5, last_login: new Date().toISOString() }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <h1 className="text-2xl font-bold text-white">Cuentas de Servicio (GemDrive)</h1>
          <p className="text-gray-400 mt-1">
            Gestiona las cuentas (Service Accounts / Microsoft Accounts) usadas para almacenar archivos.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Añadir Cuenta</span>
        </button>
      </div>

      <AccountsTable 
        accounts={accounts} 
        loading={isLoading} 
      />

      {isModalOpen && (
        <CreateAccountModal
          onClose={handleCloseModal}
          onSuccess={() => { mutate(); handleCloseModal(); }}
        />
      )}
    </div>
  );
}
