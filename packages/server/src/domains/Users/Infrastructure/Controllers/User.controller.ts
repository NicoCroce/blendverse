import { procedure } from '@server/Infrastructure/trpc';
import { UserService } from '../../Application';
import z from 'zod';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = () =>
    procedure.query(async () => await this.userService.getAllUsers());

  getUser = () =>
    procedure
      .input(z.string())
      .query(async ({ input }) => await this.userService.getUser(input));

  registerUser = () =>
    procedure
      .input(
        z.object({
          name: z.string(),
          mail: z.string(),
          password: z.string(),
        }),
      )
      .mutation(
        async ({ input: { mail, name, password } }) =>
          await this.userService.registerUser(mail, name, password),
      );
}
