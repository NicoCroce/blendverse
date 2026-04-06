import { Container } from '@app/Aplication';
import { Badge } from '@app/Aplication/Components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useGetUsers } from '../Hooks';

interface FilterResultProps {
  onClick: () => void;
}

export const FilterResult = ({ onClick }: FilterResultProps) => {
  const { data, isFetching } = useGetUsers();

  if (data?.meta?.totalItems === 0) return null;

  return (
    <>
      <Container row className="absolute right-2 top-2">
        <Badge className="flex align-center cursor-pointer" onClick={onClick}>
          {isFetching ? '...' : data?.meta?.totalItems}
          <FontAwesomeIcon icon={faClose} className="pt-[1px] pl-1" />
        </Badge>
      </Container>
    </>
  );
};
