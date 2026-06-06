import { describe, expect, it, vi } from 'vitest';
import { GetEmailsByUsersId } from '../GetEmailsByUsersId.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetEmailsByUsersId usecase', () => {
  it('calls getEmailsByUsersId on the repository and returns email list', async () => {
    const emails = ['a@test.com', 'b@test.com'];
    const repository = {
      getEmailsByUsersId: vi.fn().mockResolvedValue(emails),
    };

    const useCase = new GetEmailsByUsersId(repository as never);
    const result = await useCase.execute({ input: [1, 2], requestContext });

    expect(result).toBe(emails);
    expect(repository.getEmailsByUsersId).toHaveBeenCalledWith({
      userIds: [1, 2],
      requestContext,
    });
  });
});
