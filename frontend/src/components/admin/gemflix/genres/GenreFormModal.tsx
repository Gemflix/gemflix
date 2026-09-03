import { FormModal, FormField } from "../../ui/FormModal";
import { Genre } from "./GenresTable";

interface GenreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  genre?: Genre | null;
  isSubmitting?: boolean;
}

export function GenreFormModal({ isOpen, onClose, onSubmit, genre, isSubmitting }: GenreFormModalProps) {
  
  const isEditing = !!genre;

  const fields: FormField[] = [
    {
      name: 'tmdb_id',
      label: 'TMDB ID del Género',
      type: 'number',
      required: true,
      placeholder: 'Ej: 28 (Acción)',
      defaultValue: genre?.tmdb_id || ''
    },
    {
      name: 'name',
      label: 'Nombre Personalizado (Opcional)',
      type: 'text',
      placeholder: 'Dejar en blanco para usar el de TMDB',
      defaultValue: genre?.name || ''
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && genre ? `Editar Género: ${genre.name}` : 'Añadir Nuevo Género'}
      description="Ingresa el ID del género de TheMovieDB. Automáticamente se generará el slug SEO-friendly."
      fields={fields}
      initialData={genre || {}}
      isSubmitting={isSubmitting}
    />
  );
}
