import { describe, expect, it, vi } from 'vitest';
import { ChangeTheme } from '../ChangeTheme.usecase';
import { AppError, RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('ChangeTheme usecase', () => {
  it('returns the updated theme id when the repository succeeds', async () => {
    const repository = { updateTheme: vi.fn().mockResolvedValue(3) };

    const useCase = new ChangeTheme(repository as never);
    const result = await useCase.execute({ input: 3, requestContext });

    expect(result).toBe(3);
    expect(repository.updateTheme).toHaveBeenCalledWith({
      tema: 3,
      requestContext,
    });
  });

  it('propagates ownerId via requestContext to the repository', async () => {
    const repository = { updateTheme: vi.fn().mockResolvedValue(2) };
    const ctx = new RequestContext(5, 'req-5', 42);

    const useCase = new ChangeTheme(repository as never);
    await useCase.execute({ input: 2, requestContext: ctx });

    expect(repository.updateTheme).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext: ctx }),
    );
  });

  it('throws AppError when repository returns null/falsy', async () => {
    const repository = { updateTheme: vi.fn().mockResolvedValue(null) };

    const useCase = new ChangeTheme(repository as never);

    await expect(useCase.execute({ input: 1, requestContext })).rejects.toThrow(
      AppError,
    );
  });

  it('throws error with message about update failure', async () => {
    const repository = { updateTheme: vi.fn().mockResolvedValue(0) };

    const useCase = new ChangeTheme(repository as never);

    await expect(useCase.execute({ input: 1, requestContext })).rejects.toThrow(
      'No se pudo Actualizar el Tema',
    );
  });
});
