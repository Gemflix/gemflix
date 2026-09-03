import { FormModal, FormField } from "../../ui/FormModal";
import { TvChannel } from "./TvChannelsTable";

interface TvChannelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  channel?: TvChannel | null;
  isSubmitting?: boolean;
}

export function TvChannelFormModal({ isOpen, onClose, onSubmit, channel, isSubmitting }: TvChannelFormModalProps) {
  
  const isEditing = !!channel;

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre del Canal',
      type: 'text',
      required: true,
      placeholder: 'Ej: HBO Max Latino',
      defaultValue: channel?.name || ''
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'text',
      required: true,
      placeholder: 'Ej: Películas / Deportes / Noticias',
      defaultValue: channel?.category || ''
    },
    {
      name: 'stream_url',
      label: 'URL de Transmisión (HLS / M3U8)',
      type: 'text',
      required: true,
      placeholder: 'https://ejemplo.com/stream.m3u8',
      defaultValue: channel?.stream_url || ''
    },
    {
      name: 'logo_url',
      label: 'URL del Logo (Opcional)',
      type: 'text',
      placeholder: 'https://ejemplo.com/logo.png',
      defaultValue: channel?.logo_url || ''
    },
    {
      name: 'order_index',
      label: 'Orden en la lista',
      type: 'number',
      required: true,
      defaultValue: channel?.order_index || 1
    },
    {
      name: 'is_visible',
      label: 'Visible para Usuarios',
      type: 'switch',
      defaultValue: channel ? channel.is_visible : true
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && channel ? `Editar Canal: ${channel.name}` : 'Añadir Nuevo Canal IPTV'}
      description="Agrega canales en vivo. Los usuarios VIP tendrán acceso directo a estas transmisiones continuas."
      fields={fields}
      initialData={channel || {}}
      isSubmitting={isSubmitting}
    />
  );
}
