import { Container, Page, useDevice, useURLParams } from '@app/Application';
import {
  DocumentsListWrapper,
  PDFPreview,
  SignDocument,
  SignedDetail,
} from '../Components';
import { PDFPreviewMobile } from '../Components/PDFPreview/PDFPreviewMobile';
import { useGetDocuments } from '../Hooks';
import { TDocumentSearch } from '../Document.entity';

export const DocumentsListPage = () => {
  const { isMobile } = useDevice();
  const service = useGetDocuments();
  const { searchParams } = useURLParams<TDocumentSearch>();

  return (
    <Page title="Documentos" headerRight={!isMobile && <SignDocument />}>
      <Container row>
        <div className="min-w-75 max-w-100 w-full">
          <DocumentsListWrapper service={service} />
        </div>
        {isMobile ? (
          <PDFPreviewMobile key={searchParams?.id} />
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
    </Page>
  );
};
