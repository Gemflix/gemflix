import { FormModal, FormField } from "../../ui/FormModal";
import { SharePointSite } from "./SharePointTable";

interface SharePointFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  site?: SharePointSite | null;
  isSubmitting?: boolean;
}

export function SharePointFormModal({ isOpen, onClose, onSubmit, site, isSubmitting }: SharePointFormModalProps) {
  
  const isEditing = !!site;

  const fields: FormField[] = [
    {
      name: 'account_email',
      label: 'Cuenta de Microsoft',
      type: 'text',
      required: true,
      placeholder: 'admin@gemflix.onmicrosoft.com',
      defaultValue: site?.account_email || ''
    },
    {
      name: 'site_name',
      label: 'Nombre del Sitio',
      type: 'text',
      required: true,
      placeholder: 'Gemflix Media Storage 1',
      defaultValue: site?.site_name || ''
    },
    {
      name: 'site_id',
      label: 'Site ID (Graph API)',
      type: 'text',
      required: true,
      placeholder: 'gemflix.sharepoint.com,xxx-yyy-zzz,...',
      defaultValue: site?.site_id || ''
    },
    {
      name: 'drive_id',
      label: 'Drive ID (Document Library)',
      type: 'text',
      required: true,
      placeholder: 'b!xxx-yyy-zzz...',
      defaultValue: site?.drive_id || ''
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Suspendido / Límite Alcanzado', value: 'suspended' }
      ],
      defaultValue: site?.status || 'active'
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && site ? `Editar Sitio: ${site.site_name}` : 'Añadir Sitio SharePoint'}
      description="Registra los detalles del sitio y la biblioteca de documentos extraídos desde Microsoft Graph API para utilizarlos como nodos de GemDrive."
      fields={fields}
      initialData={site || {}}
      isSubmitting={isSubmitting}
    />
  );
}
