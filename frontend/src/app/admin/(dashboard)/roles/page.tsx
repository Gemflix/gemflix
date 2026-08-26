"use client";

import { useState, useEffect } from "react";
import { ShieldPlus, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/admin/roles", { credentials: "include" }),
        fetch("/api/admin/permissions", { credentials: "include" })
      ]);
      
      if (rolesRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(Array.isArray(data) ? data : []);
      }
      if (permsRes.ok) {
        const pdata = await permsRes.json();
        setPermissions(Array.isArray(pdata) ? pdata : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [router]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRole, permission_ids: selectedPermissions }),
        credentials: "include"
      });
      if (res.ok) {
        setIsRoleModalOpen(false);
        setNewRole({ name: "", description: "" });
        setSelectedPermissions([]);
        fetchRoles();
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const groupedPermissions = permissions.reduce((acc: any, p: any) => {
    if (!acc[p.group_name]) acc[p.group_name] = [];
    acc[p.group_name].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Roles y Permisos</h1>
          <p className="text-gray-400">Define niveles de acceso y permisos para el staff de la plataforma.</p>
        </div>
        <button 
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Nuevo Rol</span>
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-light rounded-lg">
            <ShieldPlus size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Roles del Sistema</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface-border rounded-lg w-full"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border text-gray-400">
                  <th className="pb-4 font-medium">Nombre del Rol</th>
                  <th className="pb-4 font-medium">Descripción</th>
                  <th className="pb-4 font-medium">Tipo</th>
                  <th className="pb-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {roles.map((role, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white px-2 py-1 bg-white/5 inline-block rounded border border-white/10">{role.name}</div>
                    </td>
                    <td className="py-4 text-gray-300">{role.description}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        role.is_system 
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {role.is_system ? "Sistema (Fijo)" : "Personalizado"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Editar Permisos">
                          <Edit2 size={18} />
                        </button>
                        {!role.is_system && (
                          <button className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors" title="Eliminar Rol">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No hay roles registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1c23] border border-surface-border rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">Crear Nuevo Rol</h3>
              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Identificador del Rol</label>
                    <input type="text" required value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent font-mono text-sm" placeholder="ej. analista_datos" />
                    <p className="text-xs text-gray-500 mt-1">Usar minúsculas y guiones bajos en lugar de espacios.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                    <textarea required value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent h-19 resize-none" placeholder="Descripción del rol..." />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <ShieldPlus size={18} className="text-accent" />
                    Asignación de Permisos
                  </h4>
                  <div className="space-y-4">
                    {Object.keys(groupedPermissions).map(group => (
                      <div key={group} className="bg-black/20 border border-white/5 rounded-xl p-4">
                        <h5 className="font-medium text-gray-300 mb-3">{group}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupedPermissions[group].map((p: any) => (
                            <label key={p.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                              <div className="pt-0.5">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent bg-black/50"
                                  checked={selectedPermissions.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPermissions([...selectedPermissions, p.id]);
                                    } else {
                                      setSelectedPermissions(selectedPermissions.filter(id => id !== p.id));
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-200">{p.description}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{p.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium">Guardar Rol y Permisos</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
