import { describe, it, expect } from 'vitest';
import { Certificate } from '../Certificate.entity';
import { CertificateTypes } from '../CertificateTypes.entity';

describe('Certificate entity', () => {
  const validType = CertificateTypes.create({ id: 1, name: 'Anual' });

  const validProps = {
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 20),
    returnDate: new Date(2026, 0, 25),
    reason: 'Vacaciones',
    type: validType,
    requiresRest: false,
  };

  describe('static create()', () => {
    it('creates a valid certificate with all required fields including returnDate', () => {
      const cert = Certificate.create(validProps);
      expect(cert).toBeDefined();
      expect(cert.values.startDate).toEqual(validProps.startDate);
      expect(cert.values.endDate).toEqual(validProps.endDate);
      expect(cert.values.returnDate).toEqual(validProps.returnDate);
      expect(cert.values.requiresRest).toBe(false);
    });

    it('creates with requiresRest=true', () => {
      const cert = Certificate.create({ ...validProps, requiresRest: true });
      expect(cert.values.requiresRest).toBe(true);
    });

    it('throws when startDate >= endDate', () => {
      expect(() =>
        Certificate.create({
          ...validProps,
          startDate: new Date(2026, 0, 20),
          endDate: new Date(2026, 0, 20),
        }),
      ).toThrow();
    });

    it('throws when startDate > endDate', () => {
      expect(() =>
        Certificate.create({
          ...validProps,
          startDate: new Date(2026, 0, 25),
          endDate: new Date(2026, 0, 20),
        }),
      ).toThrow();
    });

    it('throws when endDate >= returnDate', () => {
      expect(() =>
        Certificate.create({
          ...validProps,
          endDate: new Date(2026, 0, 25),
          returnDate: new Date(2026, 0, 25),
        }),
      ).toThrow();
    });

    it('throws when endDate > returnDate', () => {
      expect(() =>
        Certificate.create({
          ...validProps,
          returnDate: new Date(2026, 0, 15),
        }),
      ).toThrow();
    });
  });

  describe('get values()', () => {
    it('exposes returnDate and requiresRest', () => {
      const cert = Certificate.create(validProps);
      const vals = cert.values;
      expect(vals.returnDate).toEqual(validProps.returnDate);
      expect(vals.requiresRest).toBe(false);
    });

    it('returns all fields as a plain object', () => {
      const cert = Certificate.create(validProps);
      expect(cert.values).toMatchObject({
        startDate: validProps.startDate,
        endDate: validProps.endDate,
        returnDate: validProps.returnDate,
        reason: validProps.reason,
        requiresRest: false,
      });
    });
  });

  describe('toJSON()', () => {
    it('returns the same structure as values', () => {
      const cert = Certificate.create(validProps);
      expect(cert.toJSON()).toEqual(cert.values);
    });
  });
});
