"use client";

import { useState, useEffect } from "react";
import { X, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface RelationCrudModalProps {
  type: "genres" | "networks" | "casts" | "collections" | "countries";
  mode: "create" | "edit";
  item?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function RelationCrudModal({ type, mode, item, onClose, onSaved }: RelationCrudModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && item) {
      setFormData({ ...item });
    } else {
      setFormData({});
    }
  }, [mode, item]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const url = mode === "create" ? `/api/admin/${type}` : `/api/admin/${type}/${item.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    // Formatting specific fields if needed
    const payload = { ...formData };
    if (type === 'casts') {
      payload.gender = parseInt(payload.gender) || 0;
      payload.adult = payload.adult === true || payload.adult === 'true';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error saving");
      toast.success("Guardado correctamente");
      onSaved();
    } catch (error) {
      toast.error("Ocurrió un error al guardar.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFields = () => {
    switch (type) {
      case "genres":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre (Inglés)</label>
              <input type="text" value={formData.name_eng || ""} onChange={e => handleChange("name_eng", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre (Español)</label>
              <input type="text" value={formData.name_esp || ""} onChange={e => handleChange("name_esp", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
              <input type="text" value={formData.slug || ""} onChange={e => handleChange("slug", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Imagen (Image Path)</label>
              <input type="text" value={formData.image_path || ""} onChange={e => handleChange("image_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        );
      case "networks":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
              <input type="text" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
              <input type="text" value={formData.slug || ""} onChange={e => handleChange("slug", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Poster Path</label>
              <input type="text" value={formData.poster_path || ""} onChange={e => handleChange("poster_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Backdrop Path</label>
              <input type="text" value={formData.backdrop_path || ""} onChange={e => handleChange("backdrop_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        );
      case "casts":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
              <input type="text" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Original</label>
              <input type="text" value={formData.original_name || ""} onChange={e => handleChange("original_name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Género (1=Mujer, 2=Hombre)</label>
                <input type="number" value={formData.gender || ""} onChange={e => handleChange("gender", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Nacimiento</label>
                <input type="date" value={formData.birthday ? formData.birthday.substring(0, 10) : ""} onChange={e => handleChange("birthday", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Defunción</label>
                <input type="date" value={formData.deathday ? formData.deathday.substring(0, 10) : ""} onChange={e => handleChange("deathday", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Lugar de Nacimiento</label>
              <input type="text" value={formData.place_of_birth || ""} onChange={e => handleChange("place_of_birth", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Departamento (ej. Acting, Directing)</label>
                <input type="text" value={formData.known_for_department || ""} onChange={e => handleChange("known_for_department", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">IMDB ID</label>
                <input type="text" value={formData.imdb_id || ""} onChange={e => handleChange("imdb_id", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-pointer select-none">
                <input type="checkbox" checked={formData.adult || false} onChange={e => handleChange("adult", e.target.checked)} className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                Contenido Adulto (18+)
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Profile Path (ej. /abc.jpg)</label>
              <input type="text" value={formData.profile_path || ""} onChange={e => handleChange("profile_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Biografía</label>
              <textarea rows={4} value={formData.biography || ""} onChange={e => handleChange("biography", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-y" />
            </div>
          </div>
        );
      case "collections":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Original</label>
              <input type="text" value={formData.original_name || ""} onChange={e => handleChange("original_name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Latino</label>
              <input type="text" value={formData.name_lat || ""} onChange={e => handleChange("name_lat", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Español</label>
              <input type="text" value={formData.name_esp || ""} onChange={e => handleChange("name_esp", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Inglés</label>
              <input type="text" value={formData.name_eng || ""} onChange={e => handleChange("name_eng", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
              <input type="text" value={formData.slug || ""} onChange={e => handleChange("slug", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descripción / Sinopsis</label>
              <textarea rows={4} value={formData.overview || ""} onChange={e => handleChange("overview", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Poster Path</label>
                <input type="text" value={formData.poster_path || ""} onChange={e => handleChange("poster_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Backdrop Path</label>
                <input type="text" value={formData.backdrop_path || ""} onChange={e => handleChange("backdrop_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        );
      case "countries":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
              <input type="text" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Inglés</label>
              <input type="text" value={formData.english_name || ""} onChange={e => handleChange("english_name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">ISO 3166-1 (ej. US, JP)</label>
              <input type="text" value={formData.iso_3166_1 || ""} onChange={e => handleChange("iso_3166_1", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Logo Path</label>
              <input type="text" value={formData.logo_path || ""} onChange={e => handleChange("logo_path", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white capitalize">
            {mode === "create" ? "Añadir" : "Editar"} {type}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {renderFields()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 font-medium hover:text-white transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}
