import { useState } from 'react';
import { useGetUser } from '../Hooks';
import { Input } from '@app/Aplication/Components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
} from '@app/Aplication/Components/ui/card';
import { Title } from '@app/Aplication/Components/Typography/Title';

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
      {data && (
        <Card>
          <CardHeader>
            <Title variant="h3">Detalle de Usuario</Title>
          </CardHeader>
          <CardContent>{JSON.stringify(data)}</CardContent>
        </Card>
      )}
    </div>
  );
};
