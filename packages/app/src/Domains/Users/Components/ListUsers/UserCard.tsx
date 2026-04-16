import { To } from 'react-router-dom';
import { Card } from '@app/Aplication/Components/ui/card';
import { EditDelete } from '@app/Aplication/Components/Organisms/EditDelete';
import { USERS_UPDATE } from '../../Users.routes';
import { useDeleteUser } from '../../Hooks';
import { TUser } from '../../User.entity';
import { Text } from '@app/Aplication/Components/Molecules/Text';
import { Container } from '@app/Aplication/Components/Layout/Container';

export const UserCard = ({ data: user }: { data: TUser }) => {
  const { mutate } = useDeleteUser();
  const detailPath = (id: number): To =>
    USERS_UPDATE.replace(':id', String(id));

  return (
    <Card className="p-4">
      <Container space="small">
        <Container row justify="between" align="start">
          <Container space="none" className="flex-1 min-w-0">
            <Text className="font-semibold line-clamp-3">{user.name}</Text>
            <Text.Muted className="text-xs">ID: {user.id}</Text.Muted>
          </Container>

          <EditDelete
            editPath={detailPath(user.id!)}
            onDelete={() => mutate(Number(user.id))}
          />
        </Container>

        <Container space="none">
          <Text.Muted className="text-xs">Mail</Text.Muted>
          <Text.Label className="font-medium">{user.mail}</Text.Label>
        </Container>
      </Container>
    </Card>
  );
};
