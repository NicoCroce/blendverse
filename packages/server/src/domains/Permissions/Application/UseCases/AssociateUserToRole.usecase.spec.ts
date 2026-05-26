import { describe, expect, it, vi } from 'vitest';
import { AssociateUserToRole } from './AssociateUserToRole.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('AssociateUserToRole usecase', () => {
  it('calls associateUserToRole when role is provided', async () => {
    const repository = {
      associateUserToRole: vi.fn().mockResolvedValue(undefined),
      dissociateUserToRole: vi.fn(),
    };

    const useCase = new AssociateUserToRole(repository as never);
    await useCase.execute({
      input: { role: 'Admin', userId: 5 },
      requestContext,
    });

    expect(repository.associateUserToRole).toHaveBeenCalledWith({
      role: 'Admin',
      userId: 5,
      requestContext,
    });
    expect(repository.dissociateUserToRole).not.toHaveBeenCalled();
  });

  it('calls dissociateUserToRole when role is null/falsy', async () => {
    const repository = {
      associateUserToRole: vi.fn(),
      dissociateUserToRole: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new AssociateUserToRole(repository as never);
    await useCase.execute({ input: { role: null, userId: 7 }, requestContext });

    expect(repository.dissociateUserToRole).toHaveBeenCalledWith({
      userId: 7,
      requestContext,
    });
    expect(repository.associateUserToRole).not.toHaveBeenCalled();
  });
});
