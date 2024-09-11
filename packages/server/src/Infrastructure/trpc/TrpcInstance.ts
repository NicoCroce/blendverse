import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyTokenInHeader } from '../Auth/Auth';
import { verifyToken } from '@server/utils/JWT';
import { loggerContext } from '@server/utils/pino';

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const requestContext = {
    userId: res.getHeader('userId') as string,
    requestId: res.getHeader('requestId') as string,
  };

  console.log('\n\n=================================\n');
  loggerContext(requestContext).info(
    `START REQUEST[${requestContext.requestId}] => ${req.method} - ${decodeURIComponent(req.url)}`,
  );

  return {
    cookies: req.cookies,
    res,
    requestContext,
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
      data: {
        code,
        httpStatus,
      },
    };
  },
});

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
    dataToken = (await verifyToken(token)) as { id: string };
  } catch {
    throw new TRPCError({
      message: 'Token error',
      code: 'UNAUTHORIZED',
    });
  }

  const userId = dataToken.id;
  const requestId = ctx.requestContext.requestId;

  return opts.next({
    ctx: {
      res: ctx.res,
      requestContext: { userId, requestId },
    },
  });
});

const { router, procedure } = t;

export { trpcExpress, procedure, router, t, protectedProcedure };
