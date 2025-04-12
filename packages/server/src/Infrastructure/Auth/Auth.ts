import { RequestContext } from '@server/Application';
import { verifyToken } from '@server/utils/JWT';
import { logger, loggerContext } from '@server/utils/pino';
import { Request, Response, NextFunction } from 'express';

export const verifyTokenInHeader = (cookies: Record<string, unknown>) => {
  const auth_token = cookies.auth_token as string;

  if (!auth_token) {
    logger.error('Token not provided');
    return undefined;
  }

  return auth_token || '';
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = verifyTokenInHeader(req.cookies) as string;
  if (!token) {
    return res.status(401).json({
      message: 'No tiene token',
      code: 'UNAUTHORIZED',
    });
  }

  let dataToken;

  try {
    dataToken = (await verifyToken(token)) as { id: number; ownerId: number };
  } catch {
    return res.status(401).json({
      message: 'No tiene token válido',
      code: 'UNAUTHORIZED',
    });
  }

  const userId = dataToken.id;
  const ownerId = dataToken.ownerId;

  const requestId = res.getHeader('requestId') as string;

  const requestContext = new RequestContext(userId, requestId, ownerId);

  logger.info('\n\n=================================\n');
  loggerContext(requestContext).info(
    `START REQUEST[${requestContext.values.requestId}] => ${req.method} - ${decodeURIComponent(req.url)}`,
  );

  req.requestContext = requestContext;
  next();
};
