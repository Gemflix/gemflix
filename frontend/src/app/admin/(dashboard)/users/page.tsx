"use client";

import { useState, useEffect } from "react";
import { Users, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administra las cuentas, roles y permisos de todos los usuarios del ecosistema.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors font-medium">
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-light rounded-lg">
            <Users size={20} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">Todos los Usuarios</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
                {users.map((user, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{user.name || "Usuario"}</div>
                    </td>
                    <td className="py-4 text-gray-300">{user.email}</td>
                    <td className="py-4 text-gray-300 capitalize">{user.role || "user"}</td>
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
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
