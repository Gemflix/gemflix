import { FormModal, FormField } from "../../ui/FormModal";
import { GemflixUser } from "./UsersTable";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user?: GemflixUser | null;
  isSubmitting?: boolean;
}

export function UserFormModal({ isOpen, onClose, onSubmit, user, isSubmitting }: UserFormModalProps) {
  
  const isEditing = !!user;

  const fields: FormField[] = [
    {
      name: 'username',
      label: 'Nombre de Usuario',
      type: 'text',
      required: true,
      defaultValue: user?.username || ''
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      defaultValue: user?.email || ''
    },
    {
      name: 'password',
      label: isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña',
      type: 'password',
      required: !isEditing,
      placeholder: isEditing ? 'Dejar en blanco para no cambiar' : 'Requerido para cuentas nuevas'
    },
    {
      name: 'status',
      label: 'Estado de la Cuenta',
      type: 'select',
      required: true,
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Suspendido (Temporal)', value: 'suspended' },
        { label: 'Baneado (Permanente)', value: 'banned' }
      ],
      defaultValue: user?.status || 'active'
    },
    {
      name: 'is_premium',
      label: 'Membresía VIP',
      type: 'switch',
      defaultValue: user ? user.is_premium : false
    }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing && user ? `Administrar Usuario: ${user.username || user.email}` : 'Registrar Nuevo Usuario'}
      description="Gestiona el estado, membresía y accesos directos de este cliente."
      fields={fields}
      initialData={user || {}}
      isSubmitting={isSubmitting}
    />
  );
}
