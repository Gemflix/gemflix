import { FormModal, FormField } from "../../ui/FormModal";
import { Collection } from "./CollectionsTable";

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  collection?: Collection | null;
  isSubmitting?: boolean;
}

export function CollectionFormModal({ isOpen, onClose, onSubmit, collection, isSubmitting }: CollectionFormModalProps) {
  
  const isEditing = !!collection;

  const fields: FormField[] = [
    {
      name: 'tmdb_id',
      label: 'TMDB ID de la Colección',
      type: 'number',
      required: true,
      placeholder: 'Ej: 119 (Star Wars Collection)',
      defaultValue: collection?.tmdb_id || ''
    },
    {
      name: 'name',
      label: 'Nombre Personalizado (Opcional)',
      type: 'text',
      placeholder: 'Dejar en blanco para usar el de TMDB',
      defaultValue: collection?.name || ''
    },
    {
      name: 'is_visible',
      label: 'Visible para Usuarios',
      type: 'switch',
      defaultValue: collection ? collection.is_visible : true
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && collection ? `Editar Colección: ${collection.name}` : 'Añadir Nueva Colección'}
      description="Ingresa el ID de la colección de TheMovieDB. El sistema agrupará las películas relacionadas automáticamente."
      fields={fields}
      initialData={collection || {}}
      isSubmitting={isSubmitting}
    />
  );
}
