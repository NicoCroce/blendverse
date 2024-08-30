import { procedure } from '@server/Infrastructure';
import { AuthService } from '../../Application';
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
    .mutation(async ({ input: { username, password } }) =>
      this.authService.login(username, password),
    );

  register = procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input: { username, password } }) =>
      this.authService.register(username, password),
    );
}
