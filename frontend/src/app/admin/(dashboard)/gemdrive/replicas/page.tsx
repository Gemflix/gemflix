"use client";

import { useState, useEffect, useCallback } from "react";
import { Server, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ReplicasTable, ReplicaTarget } from "@/components/admin/gemdrive/replicas/ReplicasTable";
import { CreateReplicaModal } from "@/components/admin/gemdrive/replicas/CreateReplicaModal";
import { ServiceAccount } from "@/components/admin/gemdrive/accounts/AccountsTable";

export default function GemDriveReplicasPage() {
  const [replicas, setReplicas] = useState<ReplicaTarget[]>([]);
  const [accounts, setAccounts] = useState<ServiceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [replicasRes, accountsRes] = await Promise.all([
        apiFetch("/api/admin/drive/replicas"),
        apiFetch("/api/admin/drive/accounts")
      ]);
      
      if (replicasRes.ok) setReplicas(await replicasRes.json());
      if (accountsRes.ok) setAccounts(await accountsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="text-accent" />
            GemReplicas (Targets)
          </h1>
          <p className="text-gray-400 mt-1">Unidades donde GemDrive clona el video temporalmente para evitar cuotas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Réplica
        </button>
      </div>

      <ReplicasTable replicas={replicas} loading={loading} />

      <CreateReplicaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        accounts={accounts}
      />
    </div>
  );
}
