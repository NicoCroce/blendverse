import { Modal } from '@app/Application/Components';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useGlobalStore } from '@app/Application';
import { TUserLogged } from '../../User.entity';

export const ChangePasswordModal = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');

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
