import { EmptyState } from '@app/Application';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import { CreateSegmentDialog } from './CreateSegmentDialog';

export const SegmentsEmptyState = () => (
  <EmptyState
    icon={faTags}
    title="Todavía no hay segmentos"
    description="Los segmentos agrupan usuarios para organizar el acceso a documentos. Creá el primero para empezar."
  >
    <CreateSegmentDialog />
  </EmptyState>
);
