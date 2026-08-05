import { inferRouterOutputs } from '@trpc/server';
import { TDocumentRouter, TStateDocument } from '@server/domains/Documents';

type TDocumentRouterOutput = inferRouterOutputs<TDocumentRouter>;

export type TDocument = NonNullable<TDocumentRouterOutput['documents']['get']>;

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
export const VALIDATED = 'validados' as const;

export const DOCUMENT_STATES = [
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
] as const satisfies readonly TStateDocument[];

export const VALID_STATES: Set<TStateDocument> = new Set([
  ...DOCUMENT_STATES,
  VALIDATED,
]);

export const normalizeState = (value?: string | null): TStateDocument =>
  value && VALID_STATES.has(value as TStateDocument)
    ? (value as TStateDocument)
    : PENDING;

export type { TStateDocument };
