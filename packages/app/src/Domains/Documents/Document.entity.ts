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
  segmentos?: string;
};

export const PENDING = 'pendientes' as const;
export const UNDER_CONFORMITY = 'bajo_conformidad' as const;
export const WITHOUT_CONFORMITY = 'sin_conformidad' as const;
export const VALIDATED = 'validados' as const; // legacy: compatibilidad de URLs, sin opción de UI

/** Estados con opción de UI en el selector de conformidad (sin `validados` legacy). */
export const DOCUMENT_STATES = [
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
] as const satisfies readonly TStateDocument[];

/** Todos los estados aceptados por el contrato (incluye el legacy `validados`). */
export const VALID_STATES: Set<TStateDocument> = new Set([
  ...DOCUMENT_STATES,
  VALIDATED,
]);

/** Normaliza un valor de estado desde la URL al valor válido más cercano (FR-008). */
export const normalizeState = (value?: string | null): TStateDocument =>
  value && VALID_STATES.has(value as TStateDocument)
    ? (value as TStateDocument)
    : PENDING;

export type { TStateDocument };
