import { IRequestContext } from '@server/Application';
import { Document } from './Document.entity';
import { TStateDocument } from './Document.types';

type TFilters = {
  filters: {
    requireSign?: boolean | null;
    type?: string;
    title?: string;
    date?: Date | null;
    signed?: boolean | null;
    view?: boolean | null;
    state?: TStateDocument;
    segmentos?: number[];
  };
};

export interface IGetDocumentsRepository extends IRequestContext, TFilters {}
export interface IViewDocumentRepository extends IRequestContext {
  id: number;
}
export interface ISignDocumentRepository extends IRequestContext {
  id: number;
  validationSign: string;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

export interface IGetDocumentRepository extends IRequestContext {
  id: number;
}

export type IGetDocumentsByCompanyRepository = IGetDocumentsRepository;

export type IGetStatisticsDocumentsRepository = IRequestContext;
export interface IGetStatisticsDocumentsResponseRepository {
  total: number;
  pending: number;
  validated: number;
}

// ── Reporte diario (daily-admin-report) ─────────────────────────────────────

export type IGetUnsignedDocumentsRepository = IRequestContext;
export type ICountUnsignedDocumentsRepository = IRequestContext;

export interface IUnsignedDocumentRecord {
  documentId: number;
  documentTitle: string;
  employeeId: number;
  employeeName: string;
  viewStatus: 'Visto' | 'No visto';
}

// ── Recordatorios de empleados (employee-daily-reminders) ───────────────────

export interface IPendingDocumentForEmployee {
  documentId: number;
  documentTitle: string;
  isUnsigned: boolean; // firmado IS NULL
  isUnviewed: boolean; // visualizado IS NULL
}

export interface IDocumentToCreate {
  employeeId?: number;
  tipo: number;
  titulo: string;
  archivo: string;
  extension?: string;
}

export interface IGetPendingDocumentsByEmployeeRepository extends IRequestContext {
  employeeId: number;
}

/** Registro de pendiente que incluye el empleado dueño, para agrupar en memoria
 *  el resultado del batch de `getPendingDocumentsByEmployees` (mejora N+1). */
export interface IPendingDocumentForEmployeeWithEmployeeId extends IPendingDocumentForEmployee {
  employeeId: number;
}

export interface IGetPendingDocumentsByEmployeesRepository extends IRequestContext {
  employeeIds: number[];
}

export interface ICreateDocumentsRepository extends IRequestContext {
  documents: IDocumentToCreate[];
}

export interface ICreatedDocumentRecord {
  id: number;
  employeeId?: number;
  titulo: string;
}

export interface DocumentRepository {
  getDocuments({
    filters,
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]>;
  getDocument({
    id,
    requestContext,
  }: IGetDocumentRepository): Promise<Document | null>;
  viewDocument({
    requestContext,
    id,
  }: IViewDocumentRepository): Promise<number | null>;
  signDocument({
    requestContext,
    id,
    validationSign,
    agreement,
  }: ISignDocumentRepository): Promise<number | null>;
  getDocumentsByCompany({
    requestContext,
  }: IGetDocumentsByCompanyRepository): Promise<Document[]>;
  getStatisticsDocuments({
    requestContext,
  }: IGetStatisticsDocumentsRepository): Promise<IGetStatisticsDocumentsResponseRepository>;
  // Reporte diario (daily-admin-report)
  getUnsignedDocuments(
    params: IGetUnsignedDocumentsRepository,
  ): Promise<IUnsignedDocumentRecord[]>;
  countUnsignedDocuments(
    params: ICountUnsignedDocumentsRepository,
  ): Promise<number>;
  // Recordatorios de empleados (employee-daily-reminders)
  getPendingDocumentsByEmployee(
    params: IGetPendingDocumentsByEmployeeRepository,
  ): Promise<IPendingDocumentForEmployee[]>;
  getPendingDocumentsByEmployees(
    params: IGetPendingDocumentsByEmployeesRepository,
  ): Promise<IPendingDocumentForEmployeeWithEmployeeId[]>;
  createDocuments(
    params: ICreateDocumentsRepository,
  ): Promise<ICreatedDocumentRecord[]>;
}
