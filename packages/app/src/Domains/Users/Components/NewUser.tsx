import { Button } from '@app/Aplication/Components/ui/button';
import { useAddUser } from '../Hooks';

export const NewUser = () => {
  const { mutate, isPending } = useAddUser();

  return (
    <Button
      onClick={() =>
        mutate({
          name: crypto.randomUUID(),
          mail: 'nicoc123@gmail.com',
          password: '123456789',
        })
      }
      disabled={isPending}
    >
      Agregar
    </Button>
  );
};
