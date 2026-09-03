"use client";

import { useApi } from "@/hooks/useApi";
import { RolesTable } from "@/components/admin/global/roles/RolesTable";

export default function RolesPage() {
  const { data, isLoading } = useApi('/admin/roles');
  
  // Datos mockeados si no hay API aún
  const roles = data?.data || [
    { id: 1, name: 'Super Administrador', slug: 'superadmin', permissions_count: 42, users_count: 1, is_system_role: true },
    { id: 2, name: 'Administrador', slug: 'admin', permissions_count: 28, users_count: 3, is_system_role: true },
    { id: 3, name: 'Moderador', slug: 'moderator', permissions_count: 12, users_count: 5, is_system_role: true },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles y Permisos</h1>
          <p className="text-gray-400 mt-1">
            Visualiza los niveles de acceso disponibles para el Staff. Los roles del sistema están protegidos.
          </p>
        </div>
      </div>

      <RolesTable 
        roles={roles} 
        loading={isLoading} 
      />
    </div>
  );
}
