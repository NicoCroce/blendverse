import { TRPCError } from '@trpc/server';
import { IErrorAdapter } from '../Interfaces/';
import { AppError, RequestContext } from '../Entities';
import { logger, loggerContext } from '@server/utils/pino';

export class TRPCErrorAdapter implements IErrorAdapter<TRPCError> {
  adapt(error: unknown, requestContext?: RequestContext): TRPCError {
    if (requestContext) {
      loggerContext(requestContext).error(error);
    } else {
      logger.error(error);
    }

    if (error instanceof AppError) {
      return new TRPCError({
        code: this.mapHttpStatusToTRPCCode(error.statusCode),
        message: error.message,
        cause: error,
      });
    }

    // Para errores no manejados
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }

  private mapHttpStatusToTRPCCode(httpStatus: number): TRPCError['code'] {
    switch (httpStatus) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
