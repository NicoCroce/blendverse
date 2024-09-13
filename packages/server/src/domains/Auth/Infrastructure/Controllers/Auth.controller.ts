import { procedure } from '@server/Infrastructure';
import { AuthService } from '../../Application';
import z from 'zod';
import { loggerContextInput } from '@server/utils/pino';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = procedure
    .input(
      z.object({
        mail: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      loggerContextInput(ctx.requestContext, { mail: input.mail }).info(
        'Execute Service',
      );

      const requestContext = ctx.requestContext;

      const token = await this.authService.login(input, requestContext);

      loggerContextInput(ctx.requestContext, { mail: input.mail }).info(
        'Service response => ',
      );

      ctx.res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return { success: true };
    });

  logout = procedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie('auth_token');
    return { message: 'Logged out successfully' };
  });
}
