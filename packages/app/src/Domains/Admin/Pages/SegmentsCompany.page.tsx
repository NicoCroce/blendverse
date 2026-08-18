import { Page } from '@app/Application';
import { SegmentsManager } from '@app/Domains/Segments/Components/SegmentsManager';
import { CreateSegmentDialog } from '@app/Domains/Segments/Components/CreateSegmentDialog';

export const SegmentsCompanyPage = () => (
  <Page title="Segmentos" size="small" headerRight={<CreateSegmentDialog />}>
    <SegmentsManager />
  </Page>
);
