import { TStateDocument } from '@server/domains/Documents';

export type TDocument = {
  id: string | number;
  uploadDate: Date;
  title: string;
  file: unknown;
  signed: Date | null;
  reasonSignatureNonConformity: string | null;
  view: Date | null;
  type: string;
  requireSign: boolean;
  validationSign: string | null;
  agreedment: boolean | null;
  canDownload: boolean;
};

export type TDocumentSearch = {
  state?: TStateDocument;
  title?: string;
  type?: string;
  id?: string;
};

export const VALIDATED: TStateDocument = 'validados';
export const PENDING: TStateDocument = 'pendientes';
export type { TStateDocument };
