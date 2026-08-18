import { useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  useURLParams,
  useGlobalStore,
} from '@app/Application';
import { Badge } from '@app/Application/Components/ui/badge';
import { Card } from '@app/Application/Components/ui/card';
import { TDocument, TDocumentSearch } from '../Document.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClockRotateLeft,
  faThumbsDown,
  faThumbsUp,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

const IconStyle = {
  signedAgreedment: {
    icon: faThumbsUp,
    color: 'text-green-800',
  },
  signedDisagree: {
    icon: faThumbsDown,
    color: 'text-amber-600',
  },
  viewed: {
    icon: faEye,
    color: 'text-gray-800',
  },
  waiting: {
    icon: faClockRotateLeft,
    color: 'text-amber-600',
  },
};

export const Document = ({
  id,
  title,
  requireSign,
  uploadDate,
  type,
  signed,
  agreedment,
  view,
}: TDocument) => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const { setQueryData } = useGlobalStore('documentViewed');

  const handleClick = () => {
    // resetea el id para que pueda ser asignado nuevamemte. De esta forma en mobile, vuelve a cargarlo.
    updateParams({ id: undefined });
    setTimeout(() => updateParams({ id: String(id) }), 0);
    setQueryData(id);
  };

  const clasNameCard = clsx(
    'p-4 hover:cursor-pointer hover:shadow-lg transform-gpu transition-all duration-500',
    {
      'scale-95': String(id) !== searchParams?.id, // Aplica scale-95 si el id no coincide
      'shadow-lg border-primary': String(id) === searchParams?.id, // Agrega shadow-lg solo si coincide con el id
    },
  );

  const selectedStyle = useMemo(
    () =>
      signed && agreedment
        ? IconStyle.signedAgreedment
        : signed && !agreedment
          ? IconStyle.signedDisagree
          : !requireSign && view
            ? IconStyle.viewed
            : IconStyle.waiting,
    [agreedment, requireSign, signed, view],
  );

  return (
    <Card onClick={handleClick} className={clasNameCard}>
      <Container space="small">
        <Container row justify="between">
          <Title variant="h4">{title}</Title>
          <FontAwesomeIcon
            className={selectedStyle.color}
            icon={selectedStyle.icon}
          />
        </Container>
        <Text.Muted>
          {new Date(uploadDate).toLocaleDateString('es-AR')}
        </Text.Muted>
        <Container row justify="between">
          {requireSign ? <Badge>Requiere firma</Badge> : <span />}
          <Badge variant="secondary" className="capitalize">
            {type}
          </Badge>
        </Container>
      </Container>
    </Card>
  );
};
