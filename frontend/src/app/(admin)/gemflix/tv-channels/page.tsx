"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { TvChannelsTable, TvChannel } from "@/components/admin/gemflix/tv-channels/TvChannelsTable";
import { TvChannelFormModal } from "@/components/admin/gemflix/tv-channels/TvChannelFormModal";

export default function TvChannelsPage() {
  const { data, isLoading, mutate } = useApi('/admin/tv-channels');
  const channels = data?.data || [
    { id: 1, name: 'HBO Latino', category: 'Películas', stream_url: 'https://demo.com/hbo.m3u8', is_visible: true, order_index: 1 },
    { id: 2, name: 'ESPN Deportes', category: 'Deportes', stream_url: 'https://demo.com/espn.m3u8', is_visible: true, order_index: 2 }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<TvChannel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (channel?: TvChannel) => {
    setEditingChannel(channel || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChannel(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('Guardando canal:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      mutate();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Canales de TV (IPTV)</h1>
          <p className="text-gray-400 mt-1">
            Transmisiones en vivo mediante listas M3U8 o HLS para tus usuarios VIP.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          <span>Nuevo Canal</span>
        </button>
      </div>

      <TvChannelsTable 
        channels={channels} 
        loading={isLoading} 
        onEdit={handleOpenModal}
      />

      <TvChannelFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        channel={editingChannel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
