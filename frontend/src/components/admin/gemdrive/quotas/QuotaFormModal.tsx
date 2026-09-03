import { FormModal, FormField } from "../../ui/FormModal";
import { Quota } from "./QuotasTable";

interface QuotaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  quota?: Quota | null;
  isSubmitting?: boolean;
}

export function QuotaFormModal({ isOpen, onClose, onSubmit, quota, isSubmitting }: QuotaFormModalProps) {
  
  const isEditing = !!quota;

  const fields: FormField[] = [
    {
      name: 'max_size_gb',
      label: 'Límite Máximo (GB)',
      type: 'number',
      required: true,
      placeholder: 'Ej: 5000',
      defaultValue: quota?.max_size_gb || ''
    },
    {
      name: 'warning_threshold',
      label: 'Alerta de Llenado (%)',
      type: 'number',
      required: true,
      placeholder: 'Ej: 85',
      defaultValue: quota?.warning_threshold || 85
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Editar Cuota: ${quota?.replica_name || ''}`}
      description="Define el límite máximo de almacenamiento que GemDrive puede usar en este nodo y cuándo debe alertarte de que se está llenando."
      fields={fields}
      initialData={quota || {}}
      isSubmitting={isSubmitting}
    />
  );
}
