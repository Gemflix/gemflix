import { FormModal, FormField } from "../../ui/FormModal";
import { Serie } from "./SeriesTable";

interface SerieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  serie?: Serie | null;
  isSubmitting?: boolean;
}

export function SerieFormModal({ isOpen, onClose, onSubmit, serie, isSubmitting }: SerieFormModalProps) {
  
  const isEditing = !!serie;

  const fields: FormField[] = [
    {
      name: 'tmdb_id',
      label: 'TMDB ID',
      type: 'number',
      required: true,
      placeholder: 'Ej: 1399 (Game of Thrones)',
      defaultValue: serie?.tmdb_id || ''
    },
    {
      name: 'title',
      label: 'Título Personalizado (Opcional)',
      type: 'text',
      placeholder: 'Dejar en blanco para usar el de TMDB',
      defaultValue: serie?.title || ''
    },
    {
      name: 'trailer_url',
      label: 'URL del Trailer (YouTube)',
      type: 'text',
      placeholder: 'https://youtube.com/watch?v=...',
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
      defaultValue: serie?.status || 'draft'
    },
    {
      name: 'is_visible',
      label: 'Visible para Usuarios',
      type: 'switch',
      defaultValue: serie ? serie.is_visible : true
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && serie ? `Editar Serie: ${serie.title}` : 'Añadir Nueva Serie'}
      description="Ingresa el ID de TheMovieDB. Nuestro autómata en backend descargará las temporadas, episodios, posters y géneros asociados de forma asíncrona."
      fields={fields}
      initialData={serie || {}}
      isSubmitting={isSubmitting}
    />
  );
}
