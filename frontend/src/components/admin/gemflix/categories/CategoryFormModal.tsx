import { FormModal, FormField } from "../../ui/FormModal";
import { Category } from "./CategoriesTable";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  category?: Category | null;
  isSubmitting?: boolean;
}

export function CategoryFormModal({ isOpen, onClose, onSubmit, category, isSubmitting }: CategoryFormModalProps) {
  
  const isEditing = !!category;

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre de la Categoría',
      type: 'text',
      required: true,
      placeholder: 'Ej: Tendencias de Hoy',
      defaultValue: category?.name || ''
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      required: true,
      placeholder: 'Ej: tendencias-de-hoy',
      defaultValue: category?.slug || ''
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && category ? `Editar Categoría: ${category.name}` : 'Añadir Nueva Categoría'}
      description="Crea carruseles personalizados para la página de inicio. (Ej: 'Recién Añadidas', 'Recomendadas para ti')."
      fields={fields}
      initialData={category || {}}
      isSubmitting={isSubmitting}
    />
  );
}
