import { useAddUser } from '../Hooks';

export const NewUser = () => {
  const { mutate, isPending } = useAddUser();

  return (
    <button
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
    </button>
  );
};
