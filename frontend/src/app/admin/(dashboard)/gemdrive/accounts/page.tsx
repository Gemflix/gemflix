"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AccountsTable, ServiceAccount } from "@/components/admin/gemdrive/accounts/AccountsTable";
import { CreateAccountModal } from "@/components/admin/gemdrive/accounts/CreateAccountModal";

export default function GemDriveAccountsPage() {
  const [accounts, setAccounts] = useState<ServiceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/admin/drive/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchAccounts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-accent" />
            Cuentas de Servicio (Identidades)
          </h1>
          <p className="text-gray-400 mt-1">Administra las identidades de Google Drive que el sistema usa para acceder a los archivos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Identidad
        </button>
      </div>

      <div className="glass-panel border border-surface-border rounded-xl overflow-hidden">
        <AccountsTable accounts={accounts} loading={loading} />
      </div>

      {isModalOpen && (
        <CreateAccountModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
}
