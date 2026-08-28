"use client";

import { useState, useEffect, useCallback } from "react";
import { HardDrive, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SourcesTable, DriveSource } from "@/components/admin/gemdrive/sources/SourcesTable";
import { CreateSourceModal } from "@/components/admin/gemdrive/sources/CreateSourceModal";
import { ServiceAccount } from "@/components/admin/gemdrive/accounts/AccountsTable";

export default function GemDriveSourcesPage() {
  const [sources, setSources] = useState<DriveSource[]>([]);
  const [accounts, setAccounts] = useState<ServiceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sourcesRes, accountsRes] = await Promise.all([
        apiFetch("/api/admin/drive/sources"),
        apiFetch("/api/admin/drive/accounts")
      ]);
      
      if (sourcesRes.ok) setSources(await sourcesRes.json());
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
            <HardDrive className="text-accent" />
            Fuentes (Catálogo)
          </h1>
          <p className="text-gray-400 mt-1">Carpetas raíz de Google Drive de solo lectura para indexar en Gemflix.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Fuente
        </button>
      </div>

      <div className="glass-panel border border-surface-border rounded-xl overflow-hidden">
        <SourcesTable sources={sources} loading={loading} />
      </div>

      {isModalOpen && (
        <CreateSourceModal 
          accounts={accounts}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
}
