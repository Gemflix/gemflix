"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, MoreVertical, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Modal states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  
  // Form states
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role_id: "" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch("/api/admin/staff", { credentials: "include" }),
        fetch("/api/admin/roles", { credentials: "include" })
      ]);
      
      if (staffRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(Array.isArray(staffData) ? staffData : []);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStaff, role_id: Number(newStaff.role_id) }),
        credentials: "include"
      });
      if (res.ok) {
        setIsStaffModalOpen(false);
        setNewStaff({ name: "", email: "", password: "", role_id: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating staff:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Staff y Roles</h1>
          <p className="text-gray-400">Administra a los administradores, moderadores y roles del ecosistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <UserPlus size={20} />
            <span>Nuevo Staff</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-light rounded-lg">
            <ShieldAlert size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Miembros del Equipo</h2>
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
                  <th className="pb-4 font-medium">Nombre</th>
                  <th className="pb-4 font-medium">Email</th>
                  <th className="pb-4 font-medium">Rol Principal</th>
                  <th className="pb-4 font-medium">Estado</th>
                  <th className="pb-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {staff.map((user, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{user.name || "Staff"}</div>
                    </td>
                    <td className="py-4 text-gray-300">{user.email}</td>
                    <td className="py-4 text-gray-300 capitalize">{user.role || "staff"}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.status === "Activo" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {user.status || "Activo"}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No hay miembros del staff registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1c23] border border-surface-border rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Añadir Nuevo Staff</h3>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                  <input type="text" required value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input type="email" required value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent" placeholder="juan@gemflix.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña Temp</label>
                  <input type="password" required value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Asignar Rol</label>
                  <select required value={newStaff.role_id} onChange={e => setNewStaff({...newStaff, role_id: e.target.value})} className="w-full bg-[#1a1c23] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent">
                    <option value="" disabled>Seleccione un rol...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} {r.is_system ? '(Sistema)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium">Crear Staff</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
