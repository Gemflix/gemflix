import { FormModal, FormField } from "../../ui/FormModal";
import { Movie } from "./MoviesTable";

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  movie?: Movie | null;
  isSubmitting?: boolean;
}

export function MovieFormModal({ isOpen, onClose, onSubmit, movie, isSubmitting }: MovieFormModalProps) {
  
  const isEditing = !!movie;

  const fields: FormField[] = [
    {
      name: 'tmdb_id',
      label: 'TMDB ID',
      type: 'number',
      required: true,
      placeholder: 'Ej: 550 (Fight Club)',
      defaultValue: movie?.tmdb_id || ''
    },
    {
      name: 'title',
      label: 'Título Personalizado (Opcional)',
      type: 'text',
      placeholder: 'Dejar en blanco para usar el de TMDB',
      defaultValue: movie?.title || ''
    },
    {
      name: 'trailer_url',
      label: 'URL del Trailer (YouTube)',
      type: 'text',
      placeholder: 'https://youtube.com/watch?v=...',
      // defaultValue: movie?.trailer_url || '' // Asumiendo que se añadirá al modelo
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Borrador (Oculto en Catálogo)', value: 'draft' },
        { label: 'Procesando (Scraping en curso)', value: 'processing' },
        { label: 'Publicado', value: 'published' }
      ],
      defaultValue: movie?.status || 'draft'
    },
    {
      name: 'is_visible',
      label: 'Visible para Usuarios',
      type: 'switch',
      defaultValue: movie ? movie.is_visible : true
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && movie ? `Editar Película: ${movie.title}` : 'Añadir Nueva Película'}
      description="Ingresa el ID de TheMovieDB. El sistema buscará y descargará automáticamente la metadata, posters y géneros en segundo plano."
      fields={fields}
      initialData={movie || {}}
      isSubmitting={isSubmitting}
    />
  );
}
