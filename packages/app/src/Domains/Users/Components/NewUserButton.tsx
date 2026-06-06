import { useNavigate } from 'react-router-dom';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@app/Application/';
import { useIsEditable } from '@/Application/Hooks/useIsEditable';
import { USERS_NEW_ROUTE } from '../Users.routes';

export const NewUserButton = () => {
  const isEditable = useIsEditable();
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    navigate(USERS_NEW_ROUTE);
  };
  return (
    <Button icon={faUser} showIcon onClick={handleClick} disabled={!isEditable}>
      Agregar usuario
    </Button>
  );
};
