import { TDocumentRouter } from '@server/domains/Documents';
import { TDocumentsTypeRouter } from '@server/domains/DocumentsTypes';
import { createTRPCReact } from '@trpc/react-query';

export const _documentsService = createTRPCReact<TDocumentRouter>();
export const DocumentsService = _documentsService.documents;

export const _documentsTypesService = createTRPCReact<TDocumentsTypeRouter>();
export const DocumentsTypesService = _documentsTypesService.documentsType;
