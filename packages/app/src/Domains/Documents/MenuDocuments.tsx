import { MenuItem } from '@app/Application';
import { DOCUMENTS_ROUTE } from './Documents.routes';
import { faFile } from '@fortawesome/free-solid-svg-icons';

export const MenuDocuments = () => (
  <MenuItem to={DOCUMENTS_ROUTE} text="Documentos" icon={faFile} />
);
