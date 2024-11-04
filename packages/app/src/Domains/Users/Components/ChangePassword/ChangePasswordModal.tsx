import { Modal } from '@app/Aplication/Components';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useGlobalStore } from '@app/Aplication';
import { TUser } from '../../User.entity';
import { useState } from 'react';

export const ChangePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { data: dataUser } = useGlobalStore<TUser>('dataUser');

  if (!dataUser || !dataUser?.renewPassword) {
    return null;
  }

  const handleClose = () => setIsOpen(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Actualizar constraseña"
      description="Debe ingresar una constraseña nueva antes de continuar"
    >
      <ChangePasswordForm onClose={handleClose} />
    </Modal>
  );
};
