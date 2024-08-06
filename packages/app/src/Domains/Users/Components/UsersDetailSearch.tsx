import { Card } from '@app/Aplication/Components/ui/card';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Aplication/Components/ui/sheet';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUser } from '../Hooks';
import { USERS_ROUTE } from '../UsersRoutes';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const UsersDetailSearch = () => {
  const { id = '' } = useParams();
  const { data, isError } = useGetUser(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      navigate(USERS_ROUTE);
      toast.error('No se encontró el usuario');
    }
  }, [isError, navigate]);

  if (isError) return null;

  return (
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
  );
};
