import { FormModal, FormField } from "../../ui/FormModal";
import { GemFile } from "./FilesTable";

interface FileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  file?: GemFile | null;
  isSubmitting?: boolean;
}

export function FileFormModal({ isOpen, onClose, onSubmit, file, isSubmitting }: FileFormModalProps) {
  
  const isEditing = !!file;

  const fields: FormField[] = [
    {
      name: 'filename',
      label: 'Nombre de Archivo Interno',
      type: 'text',
      required: true,
      defaultValue: file?.filename || ''
    },
    {
      name: 'tmdb_id',
      label: 'TMDB ID Vinculado',
      type: 'number',
      required: true,
      defaultValue: file?.tmdb_id || ''
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Listo', value: 'ready' },
        { label: 'Caído (Missing)', value: 'missing' }
      ],
      defaultValue: file?.status || 'ready'
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && file ? `Archivo: ${file.filename}` : 'Registrar Archivo Manual'}
      description="Visualiza o enlaza manualmente un archivo de video en la base de datos a un ID del catálogo (Película o Capítulo)."
      fields={fields}
      initialData={file || {}}
      isSubmitting={isSubmitting}
    />
  );
}
