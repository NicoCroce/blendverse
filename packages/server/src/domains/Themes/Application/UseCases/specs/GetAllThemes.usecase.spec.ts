import { describe, expect, it, vi } from 'vitest';
import { GetAllThemes } from '../GetAllThemes.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetAllThemes usecase', () => {
  it('calls getAllThemes on the repository and returns the result', async () => {
    const themes = [
      {
        nombre: 'Dark',
        color_clase: 'dark',
        texto_clase: 'text-white',
        color_primary_hsl: '220 90% 50%',
        id: 1,
      },
    ];
    const repository = { getAllThemes: vi.fn().mockResolvedValue(themes) };

    const useCase = new GetAllThemes(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(themes);
    expect(repository.getAllThemes).toHaveBeenCalledOnce();
    expect(repository.getAllThemes).toHaveBeenCalledWith({
      filters: undefined,
      requestContext,
    });
  });

  it('forwards optional filter input to the repository', async () => {
    const repository = { getAllThemes: vi.fn().mockResolvedValue([]) };

    const useCase = new GetAllThemes(repository as never);
    await useCase.execute({ input: { nombre: 'light' }, requestContext });

    expect(repository.getAllThemes).toHaveBeenCalledWith({
      filters: { nombre: 'light' },
      requestContext,
    });
  });
});
