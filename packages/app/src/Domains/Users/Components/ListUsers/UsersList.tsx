import { useGetUsers } from '../../Hooks';

export const UsersList = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {data?.map((user) => <li key={user.name}>{JSON.stringify(user)}</li>)}
        </ul>
      )}
    </>
  );
};
