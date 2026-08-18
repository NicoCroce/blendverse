import { router } from '@server/Infrastructure/trpc';
import { DocumentsRoutes } from './DocumentsRoutes';

const _DocumentRouter = () => router(DocumentsRoutes());
export type TDocumentRouter = ReturnType<typeof _DocumentRouter>;
