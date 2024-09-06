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
    .mutation(executeService(this.authService.login.bind(this.authService)));

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
