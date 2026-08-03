import { describe, expect, it } from 'vitest';
import { Op } from 'sequelize';
import { DocumentsFilters } from '../DocumentsFilters';

/** Fila concreta de documento (modelo) para evaluar condiciones contra WhereOptions. */
type Row = {
  firmado?: Date | null;
  firma_bajo_acuerdo?: boolean | null;
  visualizado?: Date | null;
  requiere_firma?: boolean;
};

/** Mapea la columna usada por DocumentsFilters a la fila de datos. */
function col(row: Row, key: string): unknown {
  if (key === '$DocumentsTypesModel.requiere_firma$') return row.requiere_firma;
  return (row as Record<string, unknown>)[key];
}

type Operator = { [Op.eq]?: unknown } & { [Op.is]?: unknown } & {
  [Op.not]?: unknown;
};

/** detecta si un where tiene operadores (Op.*) mediante símbolos propios. */
const hasOp = (v: object, op: symbol): boolean => Reflect.has(v, op);

/**
 * Mini-evaluador de WhereOptions (unit, con datos concretos): interpreta
 * Op.and / Op.or / Op.eq / Op.is / Op.not y comparaciones de igualdad simple.
 * Usa Reflect.ownKeys porque Op.* son claves de símbolo que Object.keys omite.
 */
function isEmpty(where: unknown): boolean {
  if (where == null) return true;
  return Reflect.ownKeys(where as object).length === 0;
}

function matches(where: unknown, row: Row): boolean {
  if (isEmpty(where)) return true;

  const w = where as Record<symbol | string, unknown>;

  if (hasOp(w, Op.and)) {
    return (w[Op.and] as unknown[]).every((branch) => matches(branch, row));
  }

  if (hasOp(w, Op.or)) {
    return (w[Op.or] as unknown[]).some((branch) => matches(branch, row));
  }

  for (const key of Reflect.ownKeys(w)) {
    const condition = w[key];
    const colKey = String(key);
    const actual = col(row, colKey);

    if (condition != null && typeof condition === 'object') {
      const c = condition as Operator;

      if (hasOp(c, Op.eq)) {
        if (actual !== c[Op.eq]) return false;
      } else if (hasOp(c, Op.is)) {
        const expectedNull = c[Op.is] === null;
        const isNull = actual === null || actual === undefined;
        if (isNull !== expectedNull) return false;
      } else if (hasOp(c, Op.not)) {
        const nested = c[Op.not] as Operator;
        if (nested && typeof nested === 'object') {
          if (hasOp(nested, Op.eq)) {
            if (actual === nested[Op.eq]) return false;
          } else if (hasOp(nested, Op.is)) {
            const expectedNull = nested[Op.is] === null;
            const isNull = actual === null || actual === undefined;
            if (isNull === expectedNull) return false;
          } else if (actual != null) {
            // Op.not sobre un valor directo: debe NO matchear
            if (actual === nested) return false;
          }
        } else if (actual === nested) {
          return false;
        }
      } else {
        // condición anidada sin operador conocido: igualdad simple
        if (actual !== condition) return false;
      }
    } else {
      if (actual !== condition) return false;
    }
  }

  return true;
}

describe('DocumentsFilters — estado de conformidad (FR-003/004/005/007, Edge Cases)', () => {
  it('pendientes: no firmado (requiere firma) O sin firma requerida y no visualizado', () => {
    const { filterValidated } = DocumentsFilters({ state: 'pendientes' });

    expect(filterValidated).toEqual({
      [Op.or]: [
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': true },
            { firmado: { [Op.is]: null } },
          ],
        },
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': false },
            { visualizado: { [Op.is]: null } },
          ],
        },
      ],
    });

    // Datos concretos que SÍ caen en pendientes
    expect(
      matches(filterValidated, { firmado: null, requiere_firma: true }),
    ).toBe(true);
    expect(
      matches(filterValidated, {
        firmado: null,
        requiere_firma: false,
        visualizado: null,
      }),
    ).toBe(true);
    // Firmado → NO pendiente
    expect(
      matches(filterValidated, {
        firmado: new Date(),
        firma_bajo_acuerdo: true,
        requiere_firma: true,
      }),
    ).toBe(false);
  });

  it('bajo_conformidad: firmado NOT NULL Y firma_bajo_acuerdo = true (FR-004)', () => {
    const { filterValidated } = DocumentsFilters({ state: 'bajo_conformidad' });

    expect(filterValidated).toEqual({
      [Op.and]: [
        { firmado: { [Op.not]: null } },
        { firma_bajo_acuerdo: { [Op.eq]: true } },
      ],
    });

    expect(
      matches(filterValidated, {
        firmado: new Date('2026-08-01T10:00:00Z'),
        firma_bajo_acuerdo: true,
      }),
    ).toBe(true);
    // firmado con acuerdo false → NO bajo conformidad
    expect(
      matches(filterValidated, {
        firmado: new Date('2026-08-01T10:00:00Z'),
        firma_bajo_acuerdo: false,
      }),
    ).toBe(false);
    // no firmado → NO bajo conformidad
    expect(
      matches(filterValidated, {
        firmado: null,
        firma_bajo_acuerdo: true,
      }),
    ).toBe(false);
  });

  it('sin_conformidad: firmado NOT NULL Y firma_bajo_acuerdo = false (FR-005)', () => {
    const { filterValidated } = DocumentsFilters({ state: 'sin_conformidad' });

    expect(filterValidated).toEqual({
      [Op.and]: [
        { firmado: { [Op.not]: null } },
        { firma_bajo_acuerdo: { [Op.eq]: false } },
      ],
    });

    expect(
      matches(filterValidated, {
        firmado: new Date('2026-08-01T10:00:00Z'),
        firma_bajo_acuerdo: false,
      }),
    ).toBe(true);
    expect(
      matches(filterValidated, {
        firmado: new Date('2026-08-01T10:00:00Z'),
        firma_bajo_acuerdo: true,
      }),
    ).toBe(false);
  });

  it('validados (legacy): semántica histórica — firmado en cualquier conformidad O sin firma requerida y visualizado (FR-007)', () => {
    const { filterValidated } = DocumentsFilters({ state: 'validados' });

    expect(filterValidated).toEqual({
      [Op.or]: [
        { firmado: { [Op.not]: null } },
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': false },
            { visualizado: { [Op.not]: null } },
          ],
        },
      ],
    });

    // Firmado con acuerdo true/false/null: cualquiera cuenta como legacy validados
    expect(
      matches(filterValidated, {
        firmado: new Date(),
        firma_bajo_acuerdo: true,
      }),
    ).toBe(true);
    expect(
      matches(filterValidated, {
        firmado: new Date(),
        firma_bajo_acuerdo: false,
      }),
    ).toBe(true);
    // Sin firma requerida y visualizado
    expect(
      matches(filterValidated, {
        firmado: null,
        requiere_firma: false,
        visualizado: new Date(),
      }),
    ).toBe(true);
    // Sin firma requerida y NO visualizado → NO validado
    expect(
      matches(filterValidated, {
        firmado: null,
        requiere_firma: false,
        visualizado: null,
      }),
    ).toBe(false);
  });

  it('edge agreedment=null: firmado con acuerdo null NO cae en ninguno de los buckets de firmados', () => {
    const bajo = DocumentsFilters({
      state: 'bajo_conformidad',
    }).filterValidated;
    const sin = DocumentsFilters({ state: 'sin_conformidad' }).filterValidated;

    const row = {
      firmado: new Date('2026-08-01T10:00:00Z'),
      firma_bajo_acuerdo: null,
      requiere_firma: true,
    };

    expect(matches(bajo, row)).toBe(false);
    expect(matches(sin, row)).toBe(false);
  });

  it('edge sin-firma-requerida-visualizado: NO cae en ninguno de los 3 buckets', () => {
    const row = {
      firmado: null,
      firma_bajo_acuerdo: null,
      requiere_firma: false,
      visualizado: new Date('2026-08-01T10:00:00Z'),
    };

    for (const state of [
      'pendientes',
      'bajo_conformidad',
      'sin_conformidad',
    ] as const) {
      const { filterValidated } = DocumentsFilters({ state });
      expect(matches(filterValidated, row)).toBe(false);
    }
  });

  it('sin state: no agrega condición de estado (lista completa)', () => {
    const { filterValidated } = DocumentsFilters({});
    expect(filterValidated).toEqual({});
  });

  it('preserva el resto de los filtros (title, signed, view, type, requireSign) sin alterar state (FR-011)', () => {
    const { whereCondition, whereConditionSisTipoDocumentos, filterValidated } =
      DocumentsFilters({
        title: 'Recibo',
        signed: true,
        view: true,
        type: 'Factura',
        requireSign: true,
        state: 'bajo_conformidad',
      });

    expect(whereCondition).toMatchObject({
      titulo: { [Op.substring]: 'Recibo' },
      firmado: { [Op.not]: null },
    });
    expect(whereConditionSisTipoDocumentos).toMatchObject({
      denominacion: { [Op.eq]: 'Factura' },
      requiere_firma: true,
    });
    expect(filterValidated).toEqual({
      [Op.and]: [
        { firmado: { [Op.not]: null } },
        { firma_bajo_acuerdo: { [Op.eq]: true } },
      ],
    });
  });
});
