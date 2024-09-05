import { protectedProcedure } from '@server/Infrastructure/trpc';
import { UsersService } from '../../Application';
import { executeService, executeServiceAlone } from '@server/Application';
import z from 'zod';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getAllUsers = protectedProcedure.query(
    executeServiceAlone(this.usersService.getAllUsers.bind(this.usersService)),
  );

  getUser = protectedProcedure
    .input(z.string())
    .query(executeService(this.usersService.getUser.bind(this.usersService)));

  registerUser = protectedProcedure
    .input(
      z.object({
        name: z.string(),
        mail: z.string(),
        password: z.string(),
      }),
    )
    .mutation(
      executeService(this.usersService.registerUser.bind(this.usersService)),
    );
}
