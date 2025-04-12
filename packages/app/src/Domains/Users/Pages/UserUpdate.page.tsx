import { Page, Text } from '@app/Aplication';
import { Card } from '@app/Aplication/Components/ui/card';
import { UserForm } from '../Components';
import { useGetUser } from '../Hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { USERS_ROUTE } from '../Users.routes';
import { toast } from 'sonner';

export const UserUpdatePage = () => {
  const { id } = useParams();
  const { currentUser, isError, isLoading } = useGetUser(Number(id));
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      navigate(USERS_ROUTE);
      toast.error('No se encontró el usuario');
    }
  }, [isError, navigate]);

  if (isError) return null;

  return (
    <Page title="Editar usuario" size="small" backButton>
      {isLoading ? (
        <Text.Small>Buscando usurio</Text.Small>
      ) : (
        <Card className="p-4">
          <UserForm
            editData={
              currentUser && {
                id: currentUser.id,
                mail: currentUser.mail,
                name: currentUser.name,
              }
            }
          />
        </Card>
      )}
    </Page>
  );
};
