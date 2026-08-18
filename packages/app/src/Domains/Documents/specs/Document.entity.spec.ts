import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_STATES,
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
  VALIDATED,
  VALID_STATES,
  normalizeState,
} from '../Document.entity';

describe('Document.entity — estados de conformidad (FR-015, FR-008)', () => {
  it('DOCUMENT_STATES tiene exactamente 3 elementos de UI, sin validados (FR-001, FR-015)', () => {
    expect(DOCUMENT_STATES).toHaveLength(3);
    expect(DOCUMENT_STATES).toEqual([
      PENDING,
      UNDER_CONFORMITY,
      WITHOUT_CONFORMITY,
    ]);
    expect(DOCUMENT_STATES).not.toContain(VALIDATED);
  });

  it('VALID_STATES tiene los 4 valores del contrato (incluye validados legacy)', () => {
    expect(VALID_STATES.size).toBe(4);
    expect(VALID_STATES.has(PENDING)).toBe(true);
    expect(VALID_STATES.has(UNDER_CONFORMITY)).toBe(true);
    expect(VALID_STATES.has(WITHOUT_CONFORMITY)).toBe(true);
    expect(VALID_STATES.has(VALIDATED)).toBe(true);
  });

  it('normalizeState: valor inválido ("zzz") → PENDING (FR-008)', () => {
    expect(normalizeState('zzz')).toBe(PENDING);
    expect(normalizeState('')).toBe(PENDING);
  });

  it('normalizeState: null y undefined → PENDING (FR-008)', () => {
    expect(normalizeState(null)).toBe(PENDING);
    expect(normalizeState(undefined)).toBe(PENDING);
  });

  it('normalizeState: validados se acepta (legacy, US3)', () => {
    expect(normalizeState('validados')).toBe(VALIDATED);
  });

  it('normalizeState: bajo/sin conformidad pasan sin cambios', () => {
    expect(normalizeState('bajo_conformidad')).toBe(UNDER_CONFORMITY);
    expect(normalizeState('sin_conformidad')).toBe(WITHOUT_CONFORMITY);
  });

  it('normalizeState: pendientes se conserva', () => {
    expect(normalizeState('pendientes')).toBe(PENDING);
  });
});
