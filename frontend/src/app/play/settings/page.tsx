"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          setUser(await userRes.json());
        } else {
          router.push("/login");
          return;
        }

        const [subsRes, plansRes] = await Promise.all([
          fetch("/api/play/billing/subscriptions/me"),
          fetch("/api/play/billing/plans")
        ]);

        if (subsRes.ok) {
          const subs = await subsRes.json();
          if (subs && subs.length > 0) setSubscription(subs[0]);
        }
        if (plansRes.ok) {
          setPlans(await plansRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-4xl font-black text-white tracking-tight mb-8">Configuración de Cuenta</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-col space-y-1 bg-[#111] p-2 rounded-xl border border-gray-800">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              Perfil
            </button>
            <button 
              onClick={() => setActiveTab("subscription")}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'subscription' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              Suscripción
            </button>
            <button 
              onClick={() => setActiveTab("devices")}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'devices' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              Dispositivos
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          
          {/* PERFIL */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Información Personal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                    <input type="text" readOnly value={user?.name || ""} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white opacity-70 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                    <input type="email" readOnly value={user?.email || ""} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white opacity-70 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUSCRIPCION */}
          {activeTab === "subscription" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Tu Plan Actual</h2>
                
                {subscription ? (
                  <div className="bg-linear-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-3xl font-black text-white">{subscription.plan_name}</h3>
                        <p className="text-purple-300 uppercase tracking-widest text-sm font-bold mt-1">Activo</p>
                      </div>
                      <div className="bg-purple-600 px-3 py-1 text-xs font-bold rounded-full text-white">
                        {subscription.category}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm mt-4">
                      <p>Inició: {new Date(subscription.starts_at).toLocaleDateString()}</p>
                      {subscription.renews_at && <p>Próxima renovación: {new Date(subscription.renews_at).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
                    <p className="text-red-400 font-medium">No tienes ninguna suscripción activa.</p>
                  </div>
                )}
              </div>

              <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
                <h2 className="text-xl font-bold text-white mb-4">Planes Disponibles</h2>
                <div className="grid grid-cols-1 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="border border-gray-800 rounded-lg p-4 flex justify-between items-center hover:bg-gray-800/30 transition-colors">
                      <div>
                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                        <p className="text-sm text-gray-500">Categoría: {plan.category} | Dispositivos: {plan.max_devices}</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DISPOSITIVOS */}
          {activeTab === "devices" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Dispositivos Activos</h2>
                <p className="text-gray-400">Pronto podrás gestionar desde aquí los dispositivos que tienen acceso a tu cuenta.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
