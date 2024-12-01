import { procedure, protectedProcedure } from '@server/Infrastructure/trpc';
import { UsersService } from '../../Application';
import { executeService } from '@server/Application';
import { loggerContextInput } from '@server/utils/pino';
import z from 'zod';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getUsers = protectedProcedure
    .input(
      z
        .object({
          name: z.string(),
        })
        .optional(),
    )
    .query(executeService(this.usersService.getUsers.bind(this.usersService)));

  getUser = protectedProcedure
    .input(z.number())
    .query(executeService(this.usersService.getUser.bind(this.usersService)));

  registerUser = procedure
    .input(
      z.object({
        name: z.string(),
        mail: z.string(),
        password: z.string(),
        rePassword: z.string(),
        role: z.string().nullable().default(null),
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

  deleteUser = protectedProcedure
    .input(z.number())
    .mutation(
      executeService(this.usersService.deleteUser.bind(this.usersService)),
    );

  updateUser = protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        mail: z.string(),
        role: z.string().nullable().default(null),
      }),
    )
    .mutation(
      executeService(this.usersService.updateUser.bind(this.usersService)),
    );

  changePassword = protectedProcedure
    .input(
      z.object({
        password: z.string(),
        newPassword: z.string(),
        rePassword: z.string(),
      }),
    )
    .mutation(
      executeService(this.usersService.changePassword.bind(this.usersService)),
    );
}
