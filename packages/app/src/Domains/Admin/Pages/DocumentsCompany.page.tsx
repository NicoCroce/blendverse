import { useMemo } from 'react';
import { Container, Page, useDevice, useURLParams } from '@app/Application';
import {
  DocumentsListWrapper,
  PDFPreview,
  SignedDetail,
  Statistics,
} from '../../Documents/Components';
import { PDFPreviewMobile } from '../../Documents/Components/PDFPreview/PDFPreviewMobile';
import { useGetDocumentsByCompany } from '../Hooks';
import { useGetUsersBySegments } from '@app/Domains/Segments/Application/segments.queries';

type DocumentsCompanyParams = {
  segmentos?: string;
};

export const DocumentsCompanyPage = () => {
  const { isMobile } = useDevice();
  const service = useGetDocumentsByCompany();
  const { searchParams } = useURLParams<DocumentsCompanyParams>();

  const segmentIds = useMemo(() => {
    const raw = searchParams?.segmentos;
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [searchParams?.segmentos]);

  const { data: filteredUserIds } = useGetUsersBySegments(
    { segmentIds },
    { enabled: segmentIds.length > 0 },
  );

  return (
    <Page title="Todos los documentos de la empresa">
      <Container>
        <Statistics />
        <Container row>
          <div className="min-w-75 max-w-100 w-full">
            <DocumentsListWrapper
              service={service}
              segmented
              filteredUserIds={
                filteredUserIds ? new Set(filteredUserIds) : undefined
              }
            />
          </div>
          {isMobile ? (
            <PDFPreviewMobile />
          ) : (
            <Container className="w-full">
              <SignedDetail />
              <Container
                justify="center"
                align="center"
                className="w-full h-[80vh] p-4 border"
              >
                <PDFPreview />
              </Container>
            </Container>
          )}
        </Container>
      </Container>
    </Page>
  );
};
