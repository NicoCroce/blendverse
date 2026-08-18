import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetDisclaimerText } from '../GetDisclaimerText.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

describe('GetDisclaimerText', () => {
  it('returns the texto_disclaimer when ownersys is found', async () => {
    const mockRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: { texto_disclaimer: 'Texto legal de prueba' },
      }),
    };

    const useCase = new GetDisclaimerText(mockRepo as never);
    const result = await useCase.execute({
      input: undefined,
      requestContext,
    });

    expect(result).toEqual({
      content: 'Texto legal de prueba',
      version: null,
    });
    expect(mockRepo.getOwnersys).toHaveBeenCalledWith({
      id: 99,
      requestContext,
    });
  });

  it('returns empty string when ownersys is not found', async () => {
    const mockRepo = {
      getOwnersys: vi.fn().mockResolvedValue(null),
    };

    const useCase = new GetDisclaimerText(mockRepo as never);
    const result = await useCase.execute({
      input: undefined,
      requestContext,
    });

    expect(result).toEqual({ content: '', version: null });
  });

  it('returns empty string when texto_disclaimer is undefined', async () => {
    const mockRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: { texto_disclaimer: undefined },
      }),
    };

    const useCase = new GetDisclaimerText(mockRepo as never);
    const result = await useCase.execute({
      input: undefined,
      requestContext,
    });

    expect(result).toEqual({ content: '', version: null });
  });
});
