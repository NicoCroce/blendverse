import { procedure } from '@server/Infrastructure';
import { AuthService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = await this.authService.login(input, ctx.requestContext);

      ctx.res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return { success: true };
    });

  register = procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        rePassword: z.string(),
      }),
    )
    .mutation(executeService(this.authService.register.bind(this.authService)));
}
