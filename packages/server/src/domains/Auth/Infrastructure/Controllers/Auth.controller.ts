import { procedure } from '@server/Infrastructure';
import { AuthService } from '../../Application';
import z from 'zod';
import { executeService } from '@server/Application';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = () =>
    procedure
      .input(
        z.object({
          mail: z.string(),
          password: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { token, user, theme } = await this.authService.login({
          input,
          requestContext: ctx.requestContext,
        });

        ctx.res.cookie('auth_token', token, {
          httpOnly: true,
          secure: false, //process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        return { ...user.values, theme };
      });

  logout = () =>
    procedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie('auth_token');
      return { message: 'Logged out successfully' };
    });

  restorePassword = () =>
    procedure
      .input(
        z
          .string()
          .min(1, { message: 'Debe ingresar un mail' })
          .email('Debe ingresar un mail válido'),
      )
      .mutation(
        executeService(this.authService.restorePassword.bind(this.authService)),
      );

  renewPasswordAuth = () =>
    procedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string(),
          rePassword: z.string(),
        }),
      )
      .mutation(
        executeService(
          this.authService.renewPasswordAuth.bind(this.authService),
        ),
      );
}
