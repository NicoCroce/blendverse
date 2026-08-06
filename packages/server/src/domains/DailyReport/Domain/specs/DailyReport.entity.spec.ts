import { describe, it, expect } from 'vitest';
import { DailyReport } from '../DailyReport.entity';
import { IDailyReportSections } from '../DailyReport.types';

/**
 * Fixture con las 7 secciones del reporte con datos concretos (US2-US8).
 */
const buildSections = (): IDailyReportSections => ({
  employeesOnLeaveToday: {
    items: [
      {
        employeeId: 1,
        employeeName: 'Juan Pérez',
        licenseType: 'Enfermedad',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        returnDate: '2026-08-08',
      },
    ],
    totalCount: 1,
  },
  pendingLicenses: {
    items: [
      {
        employeeId: 2,
        employeeName: 'María López',
        licenseType: 'Particular',
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        daysSinceRequest: 3,
      },
    ],
    totalCount: 1,
  },
  unsignedDocuments: {
    items: [
      {
        documentId: 10,
        documentTitle: 'Recibo de sueldo',
        employeeId: 3,
        employeeName: 'Carlos Gómez',
        viewStatus: 'No visto',
      },
    ],
    totalCount: 1,
  },
  pendingDisclaimerAcceptances: {
    items: [
      {
        employeeId: 4,
        employeeName: 'Ana Ruiz',
        employeeEmail: 'ana@test.com',
      },
    ],
    totalCount: 1,
  },
  upcomingVacations: {
    items: [
      {
        employeeId: 5,
        employeeName: 'Pedro Díaz',
        segmentName: 'Operaciones',
        startDate: '2026-08-16',
        endDate: '2026-08-30',
      },
    ],
    totalCount: 1,
  },
  expiringLicenses: {
    items: [
      {
        employeeId: 6,
        employeeName: 'Laura Fernández',
        licenseType: 'Maternidad',
        endDate: '2026-08-12',
      },
    ],
    totalCount: 1,
  },
  statisticalSummary: {
    activeEmployees: 50,
    licensesInProgress: 3,
    pendingLicenses: 5,
    unsignedDocuments: 10,
    pendingDisclaimerAcceptances: 8,
  },
});

describe('DailyReport entity', () => {
  const reportProps = {
    ownerId: 7,
    companyName: 'Acme S.A.',
    date: '2026-08-06',
    sections: buildSections(),
  };

  describe('static create()', () => {
    it('creates a report with ownerId, companyName, date and the 7 sections', () => {
      const report = DailyReport.create(reportProps);
      expect(report).toBeDefined();
      expect(report.values.ownerId).toBe(7);
      expect(report.values.companyName).toBe('Acme S.A.');
      expect(report.values.date).toBe('2026-08-06');
      expect(Object.keys(report.values.sections)).toHaveLength(7);
    });

    it('keeps the 7 sections intact with their items and totals', () => {
      const report = DailyReport.create(reportProps);
      const sections = report.values.sections;

      expect(sections.employeesOnLeaveToday).toEqual({
        items: [
          {
            employeeId: 1,
            employeeName: 'Juan Pérez',
            licenseType: 'Enfermedad',
            startDate: '2026-08-05',
            endDate: '2026-08-07',
            returnDate: '2026-08-08',
          },
        ],
        totalCount: 1,
      });
      expect(sections.pendingLicenses.items[0].daysSinceRequest).toBe(3);
      expect(sections.unsignedDocuments.items[0].viewStatus).toBe('No visto');
      expect(sections.pendingDisclaimerAcceptances.items[0].employeeEmail).toBe(
        'ana@test.com',
      );
      expect(sections.upcomingVacations.items[0].segmentName).toBe(
        'Operaciones',
      );
      expect(sections.expiringLicenses.items[0].endDate).toBe('2026-08-12');
      expect(sections.statisticalSummary).toEqual({
        activeEmployees: 50,
        licensesInProgress: 3,
        pendingLicenses: 5,
        unsignedDocuments: 10,
        pendingDisclaimerAcceptances: 8,
      });
    });
  });

  describe('get values()', () => {
    it('returns all fields as a plain object', () => {
      const report = DailyReport.create(reportProps);
      expect(report.values).toEqual(reportProps);
    });
  });

  describe('toJSON()', () => {
    it('returns the same structure as values', () => {
      const report = DailyReport.create(reportProps);
      expect(report.toJSON()).toEqual(report.values);
    });
  });
});
