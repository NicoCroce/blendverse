import { AlertMessage } from '@app/Application';
import { useSearchParams } from 'react-router-dom';
import { useGetDocument } from '../Hooks';

export const SignedDetail = () => {
  const [searchParams] = useSearchParams();
  const { currentDocument } = useGetDocument(
    searchParams.get('id') || undefined,
  );

  if (!currentDocument || !currentDocument?.signed) return null;

  const title = currentDocument.agreedment
    ? 'Firmado bajo conformidad'
    : 'Firmado sin conformidad';

  return (
    <AlertMessage
      variant="info"
      title={title}
      description={
        currentDocument.reasonSignatureNonConformity ??
        'Al haber firmado el documento bajo conformidad, podés descargarlo o enviártelo por mail'
      }
    />
  );
};
