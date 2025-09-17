import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@app/Aplication/Components/ui/card';
import { TUser } from '../../User.entity';
import { Badge } from '@app/Aplication/Components/ui/badge';

interface UserItemProps {
  data: TUser;
}

export const UserItem = ({ data }: UserItemProps) => {
  const { name, mail, rol, ownerId } = data;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{mail}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Badge variant="secondary">{rol}</Badge>
        <span>OwnerID{ownerId}</span>
      </CardContent>
    </Card>
  );
};
