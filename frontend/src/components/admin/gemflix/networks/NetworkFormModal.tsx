import { FormModal, FormField } from "../../ui/FormModal";
import { Network } from "./NetworksTable";

interface NetworkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  network?: Network | null;
  isSubmitting?: boolean;
}

export function NetworkFormModal({ isOpen, onClose, onSubmit, network, isSubmitting }: NetworkFormModalProps) {
  
  const isEditing = !!network;

  const fields: FormField[] = [
    {
      name: 'tmdb_id',
      label: 'TMDB ID de la Red / Productora',
      type: 'number',
      required: true,
      placeholder: 'Ej: 213 (Netflix)',
      defaultValue: network?.tmdb_id || ''
    },
    {
      name: 'name',
      label: 'Nombre Personalizado (Opcional)',
      type: 'text',
      placeholder: 'Dejar en blanco para usar el de TMDB',
      defaultValue: network?.name || ''
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && network ? `Editar Productora: ${network.name}` : 'Añadir Nueva Productora'}
      description="Ingresa el ID de la red de TheMovieDB (Ej: 213 para Netflix, 49 para HBO). El logo se descargará automáticamente."
      fields={fields}
      initialData={network || {}}
      isSubmitting={isSubmitting}
    />
  );
}
