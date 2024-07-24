import { useState } from 'react';
import { useGetUser } from '../Hooks';
import { Input } from '@app/Aplication/Components/ui/input';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const { refetch, data } = useGetUser(userId);

  return (
    <div className="flex gap-4 items-stretch">
      <Input
        type="text"
        name="search"
        id=""
        onChange={({ target }) => setUserId(target.value)}
        className="max-w-[300px]"
      />
      <button onClick={() => refetch()}>Search</button>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};
