import { FormModal, FormField } from "../../ui/FormModal";
import { StaffMember } from "./StaffTable";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  member?: StaffMember | null;
  isSubmitting?: boolean;
}

export function StaffFormModal({ isOpen, onClose, onSubmit, member, isSubmitting }: StaffFormModalProps) {
  
  const isEditing = !!member;

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
      defaultValue: member?.name || ''
    },
    {
      name: 'email',
      label: 'Correo Corporativo',
      type: 'email',
      required: true,
      defaultValue: member?.email || ''
    },
    {
      name: 'password',
      label: isEditing ? 'Cambiar Contraseña (Opcional)' : 'Contraseña Temporal',
      type: 'password',
      required: !isEditing,
      placeholder: isEditing ? 'Dejar en blanco para mantener la actual' : 'Asigna una clave inicial'
    },
    {
      name: 'role',
      label: 'Nivel de Acceso',
      type: 'select',
      required: true,
      options: [
        { label: 'Moderador (Solo lectura y aprobación de contenido)', value: 'moderator' },
        { label: 'Administrador (Gestión total del catálogo y usuarios)', value: 'admin' },
        { label: 'Super Admin (Acceso a configuración del servidor y finanzas)', value: 'superadmin' }
      ],
      defaultValue: member?.role || 'moderator'
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && member ? `Editar Permisos: ${member.name}` : 'Añadir Nuevo Staff'}
      description="Otorga acceso al panel de administración. Ten mucho cuidado al asignar el rol de Super Admin."
      fields={fields}
      initialData={member || {}}
      isSubmitting={isSubmitting}
    />
  );
}
