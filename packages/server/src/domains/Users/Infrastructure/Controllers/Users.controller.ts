import { protectedProcedure } from '@server/Infrastructure/trpc';
import { UsersService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';
import { paginationZodParams } from '@server/utils';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getUsers = () =>
    protectedProcedure
      .input(
        z
          .object({
            name: z.string().optional(),
            ...paginationZodParams,
          })
          .optional(),
      )
      .query(
        executeService(this.usersService.getUsers.bind(this.usersService)),
      );

  getUser = () =>
    protectedProcedure
      .input(z.number())
      .query(executeService(this.usersService.getUser.bind(this.usersService)));

  registerUser = () =>
    protectedProcedure
      .input(
        z.object({
          name: z.string(),
          mail: z.string(),
          password: z.string(),
          rePassword: z.string(),
          role: z.string().nullable().default(null),
          profile: z.string().nullable().default(null),
        }),
      )
      .mutation(
        executeService(this.usersService.registerUser.bind(this.usersService)),
      );

  deleteUser = () =>
    protectedProcedure
      .input(z.number())
      .mutation(
        executeService(this.usersService.deleteUser.bind(this.usersService)),
      );

  updateUser = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string(),
          mail: z.string(),
          role: z.string().nullable().default(null),
          profile: z.string().nullable().default(null),
        }),
      )
      .mutation(
        executeService(this.usersService.updateUser.bind(this.usersService)),
      );

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

  getSelectUser = () =>
    protectedProcedure
      .input(
        z
          .object({
            nombre: z.string().default(''),
          })
          .optional(),
      )
      .query(
        executeService(this.usersService.getSelectUser.bind(this.usersService)),
      );
}
