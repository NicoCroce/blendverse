import { router } from '@server/Infrastructure/trpc';
import { DocumentsTypesRoutes } from './DocumentsTypes.routes';

const _DocumentsTypesRouter = () => router(DocumentsTypesRoutes());
export type TDocumentsTypeRouter = ReturnType<typeof _DocumentsTypesRouter>;
