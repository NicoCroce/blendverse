import { procedure, protectedProcedure } from '@server/Infrastructure/trpc';
import { UsersService } from '../../Application';
import { executeService, executeServiceAlone } from '@server/Application';
import z from 'zod';
import { loggerContextInput } from '@server/utils/pino';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getAllUsers = protectedProcedure.query(
    executeServiceAlone(this.usersService.getUsers.bind(this.usersService)),
  );

  getUser = protectedProcedure
    .input(z.string())
    .query(executeService(this.usersService.getUser.bind(this.usersService)));

  registerUser = procedure
    .input(
      z.object({
        name: z.string(),
        mail: z.string(),
        password: z.string(),
        rePassword: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dataLog = {
        mail: input.mail,
        name: input.name,
      };

      loggerContextInput(ctx.requestContext, dataLog).info('Execute Service');

      const response = await this.usersService.registerUser({
        input,
        requestContext: ctx.requestContext,
      });

      loggerContextInput(ctx.requestContext, dataLog).info(
        'Service response => ',
      );
      return response;
    });
}
