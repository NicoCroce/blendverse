import { Button, Container, useURLParams } from '@app/Application';
import { SignDocument } from '../SignDocument';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@app/Application/Components/ui/drawer';
import { TDocumentSearch } from '../../Document.entity';
import { useState } from 'react';
import { SignedDetail } from '../SignedDetail';
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

/* import image from '@app/Application/Images/recibo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faEye } from '@fortawesome/free-solid-svg-icons'; */

export const PDFPreviewMobile = () => {
  const { searchParams, clearParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);
  const { mutate: sendToEmail, isPending: isSendingEmail } =
    useSendDocumentToEmail();
  const [isLoading, setIsLoading] = useState(true);

  const isOpen = !!searchParams?.id;

  const handleClose = () => {
    clearParams();
    setIsLoading(true);
  };

  if (!currentDocument) return null;

  // const urlPDF = `https://docs.google.com/viewer?url=${currentDocument.file}`;

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[90%]">
        <DrawerHeader className="justify-start">
          <DrawerTitle>Detalle del documento</DrawerTitle>
        </DrawerHeader>
        <Container className="p-4 h-full">
          <SignDocument />
          <SignedDetail />
          {currentDocument.canDownload && (
            <Container row className="gap-2">
              <Button>
                <FontAwesomeIcon icon={faArrowDown} />
                <a href={currentDocument.file as string}>Descargar PDF</a>
              </Button>
              <Button
                variant="outline"
                disabled={isSendingEmail}
                onClick={() =>
                  sendToEmail({ documentId: Number(searchParams?.id) })
                }
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Enviar a mi email
              </Button>
            </Container>
          )}
          {isLoading && (
            <Alert className="max-w-lg">
              <FontAwesomeIcon icon={faHourglass} size="lg" />
              <AlertTitle>Obteniendo información</AlertTitle>
              <AlertDescription>
                Esta operación puede demorar...
              </AlertDescription>
            </Alert>
          )}
          <iframe
            src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(currentDocument.file as string)}`}
            onLoad={() => setIsLoading(false)}
            width="100%"
            height="100%"
            title="Visor de PDF"
          />
        </Container>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
