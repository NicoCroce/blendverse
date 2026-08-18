import { Route } from 'react-router-dom';
import { DocumentsListPage } from './Pages';

import { DOCUMENTS_ROUTE } from './Documents.routes';

export const DocumentsRouter = [
  <Route
    key="documents-list"
    path={DOCUMENTS_ROUTE}
    element={<DocumentsListPage />}
  />,
];
