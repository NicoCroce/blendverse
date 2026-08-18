import { describe, expect, it } from 'vitest';
import {
  DisclaimerHash,
  IPAddress,
  UserAgent,
  DisclaimerAcceptance,
} from '../DisclaimerAcceptance.entity';

describe('DisclaimerHash', () => {
  it('creates a valid hash (64 hex characters)', () => {
    const validHash = 'a'.repeat(64);
    const hash = new DisclaimerHash(validHash);
    expect(hash.value).toBe(validHash);
  });

  it('rejects a hash shorter than 64 characters', () => {
    expect(() => new DisclaimerHash('abc123')).toThrow(
      'Hash must be exactly 64 hex characters',
    );
  });

  it('rejects a hash longer than 64 characters', () => {
    expect(() => new DisclaimerHash('a'.repeat(65))).toThrow(
      'Hash must be exactly 64 hex characters',
    );
  });

  it('rejects a hash with non-hex characters', () => {
    expect(() => new DisclaimerHash('g'.repeat(64))).toThrow(
      'Hash must be exactly 64 hex characters',
    );
  });

  it('rejects an empty hash', () => {
    expect(() => new DisclaimerHash('')).toThrow(
      'Hash must be exactly 64 hex characters',
    );
  });
});

describe('IPAddress', () => {
  it('creates a valid IPv4 address', () => {
    const ip = new IPAddress('192.168.1.1');
    expect(ip.value).toBe('192.168.1.1');
  });

  it('creates a valid IPv6 address', () => {
    const ip = new IPAddress('::1');
    expect(ip.value).toBe('::1');
  });

  it('rejects an empty IP', () => {
    expect(() => new IPAddress('')).toThrow('IP address cannot be empty');
  });
});

describe('UserAgent', () => {
  it('creates with a non-empty user-agent', () => {
    const ua = new UserAgent('Mozilla/5.0');
    expect(ua.value).toBe('Mozilla/5.0');
  });

  it('allows null user-agent', () => {
    const ua = new UserAgent(null);
    expect(ua.value).toBeNull();
  });
});

describe('DisclaimerAcceptance', () => {
  const validHash = 'a'.repeat(64);

  it('creates a valid acceptance record', () => {
    const timestamp = new Date();
    const acceptance = DisclaimerAcceptance.create({
      id_usuario: 1,
      id_empresa: 99,
      hash_prueba: validHash,
      terms_version_id: 1,
      ip: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
      timestamp,
    });

    const values = acceptance.values;
    expect(values.id_usuario).toBe(1);
    expect(values.id_empresa).toBe(99);
    expect(values.hash_prueba).toBe(validHash);
    expect(values.ip).toBe('192.168.1.1');
    expect(values.user_agent).toBe('Mozilla/5.0');
    expect(values.timestamp).toBe(timestamp);
  });

  it('creates with null user_agent', () => {
    const acceptance = DisclaimerAcceptance.create({
      id_usuario: 1,
      id_empresa: 99,
      hash_prueba: validHash,
      terms_version_id: 1,
      ip: '10.0.0.1',
      user_agent: null,
      timestamp: new Date(),
    });

    expect(acceptance.values.user_agent).toBeNull();
  });

  it('allows optional id for new records', () => {
    const acceptance = DisclaimerAcceptance.create({
      id_usuario: 2,
      id_empresa: 100,
      hash_prueba: validHash,
      terms_version_id: 1,
      ip: '127.0.0.1',
      user_agent: null,
      timestamp: new Date(),
      id: 5,
    });

    expect(acceptance.values.id).toBe(5);
  });

  it('toJSON returns the same as values', () => {
    const timestamp = new Date();
    const acceptance = DisclaimerAcceptance.create({
      id_usuario: 1,
      id_empresa: 99,
      hash_prueba: validHash,
      terms_version_id: 1,
      ip: '1.1.1.1',
      user_agent: null,
      timestamp,
    });

    expect(acceptance.toJSON()).toEqual(acceptance.values);
  });
});
