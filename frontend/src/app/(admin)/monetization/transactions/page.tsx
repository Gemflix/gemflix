"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transacciones</h1>
          <p className="text-slate-400 mt-1">Historial de pagos y suscripciones de los usuarios.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          <span>Añadir Nuevo</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center text-slate-500 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <p>Módulo de <b>Transacciones</b> conectado.</p>
          <p className="text-sm mt-1">La tabla de datos será conectada con el Backend en la siguiente fase.</p>
        </div>
      </div>
    </div>
  );
}