import { describe, expect, it } from 'vitest';
import { EmployeeReminder } from '../EmployeeReminder.entity';

describe('EmployeeReminder entity (FR-008 — regla shouldSend)', () => {
  const validProps = {
    ownerId: 10,
    employeeId: 5,
    employeeName: 'Carlos Gómez',
    employeeEmail: 'carlos@test.com',
    companyName: 'Acme S.A.',
    date: '2026-08-07',
    pending: {
      unsignedDocuments: [],
      unviewedDocuments: [],
      pendingDisclaimerAcceptance: false,
      renewPassword: false,
    },
  };

  describe('static create()', () => {
    it('creates a valid entity with all required fields', () => {
      const entity = EmployeeReminder.create(validProps);
      expect(entity).toBeDefined();
      expect(entity.values.employeeId).toBe(5);
      expect(entity.values.ownerId).toBe(10);
      expect(entity.values.employeeEmail).toBe('carlos@test.com');
    });

    it('preserves the ownerId from the input (multi-tenant)', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        ownerId: 99,
      });
      expect(entity.values.ownerId).toBe(99);
    });
  });

  describe('get shouldSend() — FR-008', () => {
    it('returns false when there are no pending actions', () => {
      const entity = EmployeeReminder.create(validProps);
      expect(entity.shouldSend).toBe(false);
    });

    it('returns true when there is at least one unsigned document', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        pending: {
          ...validProps.pending,
          unsignedDocuments: [
            { documentId: 1, documentTitle: 'Recibo de sueldo' },
          ],
        },
      });
      expect(entity.shouldSend).toBe(true);
    });

    it('returns true when there is at least one unviewed document', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        pending: {
          ...validProps.pending,
          unviewedDocuments: [
            { documentId: 2, documentTitle: 'Reglamento interno' },
          ],
        },
      });
      expect(entity.shouldSend).toBe(true);
    });

    it('returns true when the disclaimer is pending acceptance', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        pending: {
          ...validProps.pending,
          pendingDisclaimerAcceptance: true,
        },
      });
      expect(entity.shouldSend).toBe(true);
    });

    it('returns true when the password renewal is pending', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        pending: {
          ...validProps.pending,
          renewPassword: true,
        },
      });
      expect(entity.shouldSend).toBe(true);
    });
  });

  describe('get values()', () => {
    it('returns all fields including the computed shouldSend', () => {
      const entity = EmployeeReminder.create({
        ...validProps,
        pending: {
          ...validProps.pending,
          renewPassword: true,
        },
      });

      expect(entity.values).toMatchObject({
        ownerId: 10,
        employeeId: 5,
        employeeName: 'Carlos Gómez',
        employeeEmail: 'carlos@test.com',
        companyName: 'Acme S.A.',
        date: '2026-08-07',
        pending: expect.objectContaining({ renewPassword: true }),
      });
      expect(entity.values.shouldSend).toBe(true);
    });

    it('does not return the entity class instance', () => {
      const entity = EmployeeReminder.create(validProps);
      expect(entity.values).not.toBeInstanceOf(EmployeeReminder);
    });
  });

  describe('toJSON()', () => {
    it('returns the same structure as values', () => {
      const entity = EmployeeReminder.create(validProps);
      expect(entity.toJSON()).toEqual(entity.values);
    });
  });
});
