import { Button } from '@app/Aplication/Components';
import { useAddUser } from '../Hooks';

export const NewUser = () => {
  const { mutate } = useAddUser();

  return (
    <Button
      onClick={() =>
        mutate({
          name: crypto.randomUUID(),
          mail: 'nicoc123@gmail.com',
          password: '123456789',
        })
      }
    >
      Agregar
    </Button>
  );
};
