import {
  AlertMessage,
  Button,
  Container,
  useURLParams,
} from '@app/Application';
import { TDocumentSearch } from '../../Document.entity';
import { useGetDocument } from '../../Hooks';
import { useSendDocumentToEmail } from '../../Hooks/useSendDocumentToEmail';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@app/Application/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faEnvelope,
  faHourglass,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export const PDFPreview = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument, isLoading } = useGetDocument(searchParams?.id);
  const { mutate: sendToEmail, isPending: isSendingEmail } =
    useSendDocumentToEmail();
  const [onLoad, setOnload] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOnload(true), 500);
    return () => {
      clearTimeout(timer);
      setOnload(false);
    };
  }, [currentDocument]);

  if (!currentDocument) {
    return (
      <AlertMessage
        variant="info"
        title="Para visualizarlo debe seleccionar un documento"
        description="Una vez lo selecciona podrá firmarlo"
      />
    );
  }

  if (isLoading || !onLoad)
    return (
      <Alert className="max-w-lg">
        <FontAwesomeIcon icon={faHourglass} size="lg" />
        <AlertTitle>Obteniendo información</AlertTitle>
        <AlertDescription>Esta opración puede demorar...</AlertDescription>
      </Alert>
    );

  const hideToolbar = !currentDocument.canDownload
    ? '#zoom=85&scrollbar=1&toolbar=0&navpanes=0'
    : '';

  return (
    <Container className="h-full w-full">
      {currentDocument.canDownload && (
        <Container row className="gap-2 mb-2">
          <a
            href={currentDocument.file as string}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowDown} className="mr-1" />
            Descargar PDF
          </a>
          <Button
            variant="outline"
            disabled={isSendingEmail}
            isLoading={isSendingEmail}
            icon={faEnvelope}
            showIcon
            onClick={() =>
              sendToEmail({ documentId: Number(searchParams?.id) })
            }
          >
            Enviar a mi email
          </Button>
        </Container>
      )}
      <object
        data={(currentDocument.file as string) + hideToolbar}
        type="application/pdf"
        width="100%"
        className="flex-1 h-full"
      >
        <p>
          PDF
          <a href={currentDocument.file as string}>
            Download pdf <span>{currentDocument.file as string}</span>
          </a>
        </p>
      </object>
    </Container>
  );
};
