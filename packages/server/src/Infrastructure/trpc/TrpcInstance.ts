import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyTokenInHeader } from '../Auth/Auth';
import { verifyToken } from '@server/Infrastructure/utils/JWT';
import { logger, loggerContext } from '@server/Infrastructure/utils/pino';
import { RequestContext } from '@server/Application';
import { addTenantScope } from '@server/Infrastructure/Database/tenantScopes';
import { UserModel } from '@server/domains/Users';
import { TiposSegmentosModel } from '@server/domains/Segments/Infrastructure/Database/TiposSegmentos.model';
import { ProfileModel } from '@server/domains/Profiles';

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const _requestContext = {
    userId: res.getHeader('userId') as number,
    requestId: res.getHeader('requestId') as string,
    xAppClient: req.headers['x-app-client'] as string | undefined,
  };

  const requestContext = new RequestContext(
    _requestContext.userId,
    _requestContext.requestId,
    0, // placeholder — replaced by verified ownerId in protectedProcedure
    _requestContext.xAppClient,
  );

  logger.info('\n\n=================================\n');
  loggerContext(requestContext).info(
    `START REQUEST[${_requestContext.requestId}] => ${req.method} - ${decodeURIComponent(req.url)}`,
  );
  loggerContext(requestContext).info(
    {
      xAppClient: _requestContext.xAppClient ?? null,
    },
    'x-app-client header received',
  );

  return {
    cookies: req.cookies,
    res,
    requestContext,
    xAppClient: _requestContext.xAppClient,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    //** Return message, code and httpStatus */
    const { shape } = opts;
    const { code, httpStatus } = shape.data;
    return {
      ...shape,
      message: shape.message.replace('TRPCError: ', ''),
      data: {
        code,
        httpStatus,
      },
    };
  },
});

/**
 * Apply dynamic tenant scopes to all multi-tenant models.
 *
 * This is a defence-in-depth safety net. The primary tenant isolation
 * lives in the TenantAwareRepository helpers and explicit `where` clauses.
 * See `tenantScopes.ts` for the concurrency caveat.
 */
const applyTenantScopes = (ownerId: number) => {
  addTenantScope(UserModel, ownerId);
  addTenantScope(TiposSegmentosModel, ownerId);
  addTenantScope(ProfileModel, ownerId);
};

const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  const token = verifyTokenInHeader(ctx.cookies) as string;
  if (!token) {
    throw new TRPCError({
      message: 'Token not provided',
      code: 'UNAUTHORIZED',
    });
  }

  let dataToken;

  try {
    dataToken = (await verifyToken(token)) as { id: number; ownerId: number };
  } catch {
    throw new TRPCError({
      message: 'Token error',
      code: 'UNAUTHORIZED',
    });
  }

  const userId = dataToken.id;
  const ownerId = dataToken.ownerId;

  // ownerId is readonly — create a new RequestContext with the verified identity
  const verifiedRequestContext = new RequestContext(
    userId,
    ctx.requestContext.values.requestId,
    ownerId,
    ctx.requestContext.values.xAppClient,
  );

  // Defence-in-depth: apply dynamic tenant scopes to multi-tenant models
  applyTenantScopes(ownerId);

  return opts.next({
    ctx: {
      res: ctx.res,
      requestContext: verifiedRequestContext,
    },
  });
});

const { router, procedure } = t;

export { trpcExpress, procedure, router, t, protectedProcedure };
