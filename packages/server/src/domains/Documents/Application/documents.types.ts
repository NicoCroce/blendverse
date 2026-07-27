import { IRequestContext } from '@server/Application';
import { Document } from '../Domain/Document.entity';
import { TStateDocument } from '../Domain/Document.types';

export interface IGetDocuments extends IRequestContext {
  input: {
    requireSign?: boolean | null;
    type?: string;
    title?: string;
    date?: Date | null;
    signed?: boolean | null;
    view?: boolean | null;
    state?: TStateDocument;
  };
}

export interface IGetDocument extends IRequestContext {
  input: number;
}

export interface IViewDocument extends IRequestContext {
  input: number;
}

export interface ISignDocument extends IRequestContext {
  input: {
    documentId: number;
    password: string;
    agreement: boolean;
    reasonSignatureNonConformity: string | null;
  };
}

export type IGetDocumentsByCompany = IGetDocuments;

export type IGetStatisticsDocuments = IRequestContext;

export type IGetDocumentsByCompanyResponse = Array<{
  userId: number;
  user: string;
  documents: Document[];
}>;

export interface ISendDocumentToEmail extends IRequestContext {
  input: {
    documentId: number;
  };
}

export interface IGetStatisticsDocumentsResponse {
  total: number;
  pending: number;
  validated: number;
}
