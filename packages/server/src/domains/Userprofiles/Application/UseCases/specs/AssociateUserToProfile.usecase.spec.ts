import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssociateUserToProfile } from '../AssociateUserToProfile.usecase';
import { AppError } from '@server/Application';
import { Userprofile } from '../../../Domain';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual('@server/Application');
  return {
    ...(actual as object),
    executeUseCase: vi.fn(),
  };
});

import { executeUseCase } from '@server/Application';

const mockRepo = {
  deleteUserprofile: vi.fn(),
  updateUserprofile: vi.fn(),
  createUserprofile: vi.fn(),
};
const mockGetAllProfilesByUser = {} as never;
const mockRequestContext = {
  values: { ownerId: 10, userId: 1 },
  setUserId: vi.fn(),
} as never;

let useCase: AssociateUserToProfile;

beforeEach(() => {
  vi.clearAllMocks();
  useCase = new AssociateUserToProfile(
    mockRepo as never,
    mockGetAllProfilesByUser,
  );
});

describe('AssociateUserToProfile UseCase', () => {
  it('should delete existing profile when profileId is null and profile exists', async () => {
    const existing = Userprofile.create({ id: 5, id_usuario: 1, id_perfil: 2 });
    vi.mocked(executeUseCase).mockResolvedValueOnce([existing]);
    mockRepo.deleteUserprofile.mockResolvedValueOnce(true);

    await useCase.execute({
      input: { userId: 1, profileId: null as never },
      requestContext: mockRequestContext,
    });

    expect(mockRepo.deleteUserprofile).toHaveBeenCalledWith({
      id: 5,
      requestContext: mockRequestContext,
    });
  });

  it('should do nothing when profileId is null and no existing profiles', async () => {
    vi.mocked(executeUseCase).mockResolvedValueOnce([]);

    await useCase.execute({
      input: { userId: 1, profileId: null as never },
      requestContext: mockRequestContext,
    });

    expect(mockRepo.deleteUserprofile).not.toHaveBeenCalled();
  });

  it('should update profile when profileId differs from existing', async () => {
    const existing = Userprofile.create({ id: 5, id_usuario: 1, id_perfil: 2 });
    vi.mocked(executeUseCase).mockResolvedValueOnce([existing]);
    mockRepo.updateUserprofile.mockResolvedValueOnce(true);

    await useCase.execute({
      input: { userId: 1, profileId: 99 },
      requestContext: mockRequestContext,
    });

    expect(mockRepo.updateUserprofile).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext: mockRequestContext }),
    );
  });

  it('should NOT update when profileId is the same as existing', async () => {
    const existing = Userprofile.create({
      id: 5,
      id_usuario: 1,
      id_perfil: 99,
    });
    vi.mocked(executeUseCase).mockResolvedValueOnce([existing]);

    await useCase.execute({
      input: { userId: 1, profileId: 99 },
      requestContext: mockRequestContext,
    });

    expect(mockRepo.updateUserprofile).not.toHaveBeenCalled();
    expect(mockRepo.createUserprofile).not.toHaveBeenCalled();
  });

  it('should create profile when no existing profiles', async () => {
    vi.mocked(executeUseCase).mockResolvedValueOnce([]);
    const newProfile = Userprofile.create({ id_usuario: 1, id_perfil: 99 });
    mockRepo.createUserprofile.mockResolvedValueOnce(newProfile);

    await useCase.execute({
      input: { userId: 1, profileId: 99 },
      requestContext: mockRequestContext,
    });

    expect(mockRepo.createUserprofile).toHaveBeenCalled();
  });

  it('should throw AppError when createUserprofile returns falsy', async () => {
    vi.mocked(executeUseCase).mockResolvedValueOnce([]);
    mockRepo.createUserprofile.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        input: { userId: 1, profileId: 99 },
        requestContext: mockRequestContext,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
