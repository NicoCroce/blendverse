import { logger } from '@server/utils/pino';

export const verifyTokenInHeader = (cookies: Record<string, unknown>) => {
  const auth_token = cookies.auth_token as string;

  if (!auth_token) {
    logger.error('Token not provided');
    return undefined;
  }

  return auth_token || '';
};
