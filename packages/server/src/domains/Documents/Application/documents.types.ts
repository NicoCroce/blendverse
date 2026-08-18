import { IRequestContext } from '@server/Application';
import { Document } from '../Domain/Document.entity';
import { TStateDocument } from '../Domain/Document.types';
import z from 'zod';

export interface IGetDocuments extends IRequestContext {
  input: {
    requireSign?: boolean | null;
    type?: string;
    title?: string;
    date?: Date | null;
    signed?: boolean | null;
    view?: boolean | null;
    state?: TStateDocument;
    segmentos?: number[];
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

// ── Ingreso de documentos (employee-daily-reminders) ────────────────────────
// `id_propietario` NUNCA llega del cliente (Pr. II): el tenant se deriva de
// `requestContext.values.ownerId`.

export const IngestDocumentSchema = z.object({
  documents: z
    .array(
      z.object({
        employeeId: z.number().optional(),
        tipo: z.number().min(1, 'Tipo requerido'),
        titulo: z.string().min(1, 'Título requerido'),
        archivo: z.string().min(1, 'Archivo requerido'),
        extension: z.string().optional(),
      }),
    )
    .min(1, 'Debe ingresar al menos un documento'),
});

export type IIngestDocumentItem = z.infer<
  typeof IngestDocumentSchema
>['documents'][number];

export type IIngestDocumentInput = z.infer<typeof IngestDocumentSchema>;

export interface IIngestDocument extends IRequestContext {
  input: IIngestDocumentInput;
}

export interface IIngestDocumentOutput {
  documentIds: number[];
  notified: boolean;
}

// ── Pendientes por empleado (employee-daily-reminders) ──────────────────────

export interface IGetPendingDocumentsByEmployee extends IRequestContext {
  input: { employeeId: number };
}

export interface IGetPendingDocumentsByEmployees extends IRequestContext {
  input: { employeeIds: number[] };
}
