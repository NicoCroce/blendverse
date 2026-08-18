import crypto from 'crypto';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetSignatureStatus } from '../GetSignatureStatus.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);
const currentTerms = {
  execute: vi.fn().mockResolvedValue({ id: 12, version: 1 }),
};

function computeExpectedHash(userId: number, timestamp: string): string {
  return crypto
    .createHmac('sha256', 'test-secret')
    .update(`${userId}:${timestamp}`)
    .digest('hex');
}

describe('GetSignatureStatus', () => {
  beforeEach(() => {
    process.env.SECRET_KEY_BACK = 'test-secret';
  });

  afterEach(() => {
    delete process.env.SECRET_KEY_BACK;
  });

  it('returns signed status when valid signature exists', async () => {
    const timestamp = '2024-01-01T00:00:00.000Z';
    const expectedHash = computeExpectedHash(1, timestamp);

    const mockRepo = {
      getStatus: vi.fn().mockResolvedValue({
        values: {
          hash_prueba: expectedHash,
          timestamp: new Date(timestamp),
          ip: '192.168.1.1',
        },
      }),
    };

    const useCase = new GetSignatureStatus(
      mockRepo as never,
      currentTerms as never,
    );
    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result).toEqual({
      signed: true,
      hash: expectedHash,
      timestamp: new Date(timestamp),
      ip: '192.168.1.1',
      corrupt: false,
    });
    expect(mockRepo.getStatus).toHaveBeenCalledWith({
      termsVersionId: 12,
      requestContext,
    });
  });

  it('returns null when no signature exists', async () => {
    const mockRepo = {
      getStatus: vi.fn().mockResolvedValue(null),
    };

    const useCase = new GetSignatureStatus(
      mockRepo as never,
      currentTerms as never,
    );
    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result).toBeNull();
  });

  it('detects corrupt state when hash does not match', async () => {
    const timestamp = '2024-01-01T00:00:00.000Z';
    const wrongHash = 'b'.repeat(64);

    const mockRepo = {
      getStatus: vi.fn().mockResolvedValue({
        values: {
          hash_prueba: wrongHash,
          timestamp: new Date(timestamp),
          ip: '192.168.1.1',
        },
      }),
    };

    const useCase = new GetSignatureStatus(
      mockRepo as never,
      currentTerms as never,
    );
    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result).toEqual({
      signed: false,
      hash: wrongHash,
      timestamp: new Date(timestamp),
      ip: '192.168.1.1',
      corrupt: true,
    });
  });
});
