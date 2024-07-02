import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Trpc } from './client';

export const App = () => {
  const [count, setCount] = useState(0);
  const { data, isLoading } = Trpc.userList.useQuery();
  const cacheUserList = Trpc.useUtils().userList;

  const addUser = Trpc.userCreate.useMutation({
    onMutate: async ({ name }) => {
      cacheUserList.cancel();
      const preservedState = cacheUserList.getData();

      const setState = (state: typeof data): typeof data => [
        ...(state || []),
        {
          id: String(state?.length),
          name,
          password: '123',
        },
      ];

      cacheUserList.setData(undefined, setState);
      return { preservedState };
    },
    onError: (_err, _variables, context) => {
      cacheUserList.setData(undefined, context?.preservedState);
    },
    onSuccess: () => {
      cacheUserList.invalidate();
    },
  });

  useEffect(() => {
    console.log('data', data);
  }, [data]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <h2>Estos son los usuarios</h2>
      <button onClick={() => addUser.mutate({ name: crypto.randomUUID() })}>
        Agregar
      </button>
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
