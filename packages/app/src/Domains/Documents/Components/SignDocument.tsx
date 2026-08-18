import { Button, Container, useURLParams } from '@app/Application';
import { TDocumentSearch } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { ConfirmWithPassword } from '@app/Application/Components/Molecules';
import { useSignDocument } from '../Hooks/useSignDocument';
import { useState } from 'react';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);
  const { mutate, isPending } = useSignDocument();
  const [sign, setSign] = useState<boolean | 'agreement' | 'disagreement'>(
    false,
  );

  if (!currentDocument) return null;

  const alreadySigned = !!currentDocument.signed;
  const showSignButtons =
    !alreadySigned || (alreadySigned && !currentDocument.agreedment);
  const disabled = !currentDocument.requireSign;

  // Si ya firmó bajo conformidad, no mostrar nada de firma
  if (!showSignButtons) return null;

  const signDocument = (password: string, reason: string) =>
    mutate(
      {
        documentId: Number(searchParams?.id),
        password,
        agreement: sign === 'agreement',
        reasonSignatureNonConformity: reason,
      },
      { onSuccess: () => setSign(false) },
    );

  const onCloseDialog = () => setSign(false);

  return (
    <>
      {showSignButtons && (
        <Container row className="flex-wrap">
          {!alreadySigned && !currentDocument.agreedment && (
            <Button
              disabled={disabled}
              variant="outline"
              icon={faThumbsDown}
              showIcon
              onClick={() => setSign('disagreement')}
              className="flex-auto"
            >
              Firmo sin conformidad
            </Button>
          )}
          <Button
            disabled={disabled}
            icon={faThumbsUp}
            showIcon
            onClick={() => setSign('agreement')}
            className="flex-auto"
          >
            Firmo con conformidad
          </Button>
        </Container>
      )}
      <ConfirmWithPassword
        onConfirm={signDocument}
        textDescription="Ingresando su constraseña confirma la firma de este documento"
        isLoading={isPending}
        isOpen={!!sign}
        onCloseDialog={onCloseDialog}
        signType={sign === 'agreement' ? 'agreement' : 'disagreement'}
      />
    </>
  );
};
