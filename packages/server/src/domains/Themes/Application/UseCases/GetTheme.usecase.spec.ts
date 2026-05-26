import { describe, expect, it, vi } from 'vitest';
import { GetTheme } from './GetTheme.usecase';
import { AppError, RequestContext } from '@server/Application';
import { Theme } from '../../Domain/Themes.entity';

const requestContext = new RequestContext(1, 'req-1', 10);

const makeTheme = () =>
  Theme.create({
    nombre: 'Light',
    color_clase: 'light',
    texto_clase: 'text-black',
    color_primary_hsl: '0 0% 100%',
    id: 1,
  });

describe('GetTheme usecase', () => {
  it('returns the theme when found', async () => {
    const theme = makeTheme();
    const repository = { getTheme: vi.fn().mockResolvedValue(theme) };

    const useCase = new GetTheme(repository as never);
    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(theme);
    expect(repository.getTheme).toHaveBeenCalledWith({ id: 1, requestContext });
  });

  it('throws AppError with 404 when theme is not found', async () => {
    const repository = { getTheme: vi.fn().mockResolvedValue(null) };

    const useCase = new GetTheme(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow(AppError);
  });

  it('throws error with message "Registro no encontrado" when not found', async () => {
    const repository = { getTheme: vi.fn().mockResolvedValue(null) };

    const useCase = new GetTheme(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow('Registro no encontrado');
  });
});
