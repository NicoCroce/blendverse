import { describe, expect, it, vi } from 'vitest';
import { GetOwnersys } from './GetOwnersys.usecase';
import { AppError, RequestContext } from '@server/Application';
import { Ownersys } from '../../Domain/Ownersyss.entity';

const requestContext = new RequestContext(1, 'req-1', 10);

const makeOwnersys = () =>
  Ownersys.create({
    denominacion: 'Acme',
    logo: 'logo.png',
    razon_social: 'Acme SRL',
    cuit: 20123456789,
    domicilio_fiscal: 'Calle 123',
    telefonos_principales: '011-1234',
    email_corporativo: 'info@acme.com',
    horarios_atencion: '9-18',
    whatsapp: '111',
    sucursal_pedido: 1,
    sucursal_presupuestos: 1,
    id: 10,
  });

describe('GetOwnersys usecase', () => {
  it('returns ownersys when found', async () => {
    const owner = makeOwnersys();
    const repository = { getOwnersys: vi.fn().mockResolvedValue(owner) };

    const useCase = new GetOwnersys(repository as never);
    const result = await useCase.execute({ input: 10, requestContext });

    expect(result).toBe(owner);
    expect(repository.getOwnersys).toHaveBeenCalledWith({
      id: 10,
      requestContext,
    });
  });

  it('throws AppError with 404 when ownersys is not found', async () => {
    const repository = { getOwnersys: vi.fn().mockResolvedValue(null) };

    const useCase = new GetOwnersys(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow(AppError);
  });

  it('throws error with message "Registro no encontrado"', async () => {
    const repository = { getOwnersys: vi.fn().mockResolvedValue(null) };

    const useCase = new GetOwnersys(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow('Registro no encontrado');
  });
});
