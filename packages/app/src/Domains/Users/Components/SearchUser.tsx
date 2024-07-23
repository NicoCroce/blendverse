import { useState } from 'react';
import { useGetUser } from '../Hooks';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const { refetch, data } = useGetUser(userId);

  return (
    <div>
      <input
        type="text"
        name="search"
        id=""
        onChange={({ target }) => setUserId(target.value)}
      />
      <button onClick={() => refetch()}>Search</button>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};
