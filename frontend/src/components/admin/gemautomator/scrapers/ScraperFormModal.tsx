import { FormModal, FormField } from "../../ui/FormModal";
import { Scraper } from "./ScrapersTable";

interface ScraperFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  scraper?: Scraper | null;
  isSubmitting?: boolean;
}

export function ScraperFormModal({ isOpen, onClose, onSubmit, scraper, isSubmitting }: ScraperFormModalProps) {
  
  const isEditing = !!scraper;

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre del Scraper',
      type: 'text',
      required: true,
      placeholder: 'Ej: TMDB Auto-Updater',
      defaultValue: scraper?.name || ''
    },
    {
      name: 'target_url',
      label: 'URL Objetivo o API Endpoint',
      type: 'text',
      required: true,
      placeholder: 'https://api.themoviedb.org/3/...',
      defaultValue: scraper?.target_url || ''
    },
    {
      name: 'status',
      label: 'Estado Inicial',
      type: 'select',
      required: true,
      options: [
        { label: 'Inactivo (Esperando ejecución manual)', value: 'idle' },
        { label: 'Ejecutándose', value: 'running' }
      ],
      defaultValue: scraper?.status || 'idle'
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && scraper ? `Editar Scraper: ${scraper.name}` : 'Añadir Nuevo Scraper'}
      description="Configura un nuevo bot de recolección de datos. Los scrapers pueden alimentarse de APIs o hacer web scraping de páginas externas."
      fields={fields}
      initialData={scraper || {}}
      isSubmitting={isSubmitting}
    />
  );
}
