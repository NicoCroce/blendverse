import { Card } from '@app/Aplication/Components/ui/card';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Aplication/Components/ui/sheet';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';
import { useParams } from 'react-router-dom';
import { useGetUser } from '../Hooks';

export const UsersDetailSearch = () => {
  const { id = '' } = useParams();
  const { data } = useGetUser(id);

  return (
    <>
      <SheetContent className="flex flex-col gap-4 p-4">
        <SheetHeader className="text-left">
          <SheetTitle>Detalles de Usuario</SheetTitle>
          <SheetDescription>Solo puedes ver el detalle.</SheetDescription>
        </SheetHeader>
        {data ? (
          <Card className="p-4">
            <ul>
              <li>
                <span>ID: </span> <span>{data.id}</span>
              </li>
              <li>
                <span>Nombre: </span> <span>{data.name}</span>
              </li>
              <li>
                <span>Mail: </span> <span>{data.mail}</span>
              </li>
            </ul>
          </Card>
        ) : (
          <Skeleton className="h-[120px] w-full rounded-xl" />
        )}
      </SheetContent>
    </>
  );
};
