import { protectedProcedure } from '@server/Infrastructure/trpc';
import { UsersService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  changePassword = () =>
    protectedProcedure
      .input(
        z.object({
          password: z.string(),
          newPassword: z.string(),
          rePassword: z.string(),
        }),
      )
      .mutation(
        executeService(
          this.usersService.changePassword.bind(this.usersService),
        ),
      );
}
