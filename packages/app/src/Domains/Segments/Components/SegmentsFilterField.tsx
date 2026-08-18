import {
  Container,
  DASHBOARD_ACCESS,
  useHasPermission,
} from '@app/Application';
import { Label } from '@app/Application/Components/ui/label';
import { SegmentsFilter } from './SegmentsFilter';

type SegmentsFilterFieldProps = {
  showLabel?: boolean;
};

export const SegmentsFilterField = ({
  showLabel = true,
}: SegmentsFilterFieldProps) => {
  const { hasPermission } = useHasPermission();

  if (!hasPermission(DASHBOARD_ACCESS)) return null;

  if (!showLabel) {
    return <SegmentsFilter />;
  }

  return (
    <Container space="small">
      <Label>Segmentos</Label>
      <SegmentsFilter />
    </Container>
  );
};
