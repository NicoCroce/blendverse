import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemesService } from '../Themes.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

describe('ThemesService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  it('delegates getAllThemes to executeUseCase', async () => {
    const themes = [{ id: 1 }];
    vi.mocked(executeUseCase).mockResolvedValue(themes as never);

    const service = new ThemesService({} as never, {} as never);
    const result = await service.getAllThemes({ requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(themes);
  });

  it('delegates getTheme to executeUseCase', async () => {
    const theme = { id: 2, nombre: 'Dark' };
    vi.mocked(executeUseCase).mockResolvedValue(theme as never);

    const service = new ThemesService({} as never, {} as never);
    const result = await service.getTheme({ input: 2, requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ input: 2, requestContext }),
    );
    expect(result).toBe(theme);
  });
});
