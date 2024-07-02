import z from 'zod';
import { addUser, getUser, getUsersList } from '@server/data/mock';
import { procedure } from '@server/trpc/TrpcInstance';

export const UsersRoutes = {
  userList: procedure.query(async () => getUsersList().then((users) => users)),
  userById: procedure
    .input(z.string())
    .query(async ({ input }) => getUser(input).then((user) => user)),
  userCreate: procedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const newUser = await addUser({ ...input });
      return newUser;
    }),
};
