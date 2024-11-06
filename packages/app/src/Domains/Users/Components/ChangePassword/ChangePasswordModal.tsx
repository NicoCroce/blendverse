import { Modal } from '@app/Aplication/Components';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useGlobalStore } from '@app/Aplication';
import { TUser } from '../../User.entity';

export const ChangePasswordModal = () => {
  const { data: dataUser } = useGlobalStore<TUser>('dataUser');

  if (!dataUser || !dataUser?.renewPassword) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      title="Actualizar constraseña"
      description="Debe ingresar una constraseña nueva antes de continuar"
    >
      <ChangePasswordForm />
    </Modal>
  );
};
