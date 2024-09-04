import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyTokenInHeader } from '../Auth/Auth';
import { verifyToken } from '@server/utils/JWT';
import { RequestContext } from '@server/Application/Entities';
import { container } from '@server/utils/Container';
import { v4 as uuidv4 } from 'uuid';

// created for each request
export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions) => {
  console.log(`🟢 ${req.method} : ${req.path} => params: `, req.query);

  return {
    headers: req.headers,
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
  const token = verifyTokenInHeader(ctx.headers);
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

  console.log('dataToken', dataToken);

  const userId = ctx.headers['user-id'] as string;
  const requestId = uuidv4();

  const requestContext = container.resolve<RequestContext>('requestContext');
  requestContext.setValues(userId, requestId);

  /*   const scope = container.createScope();

  scope.register({
    requestContext: asClass(RequestContext)
      .scoped()
      .inject(() => ({ userId, requestId })),
    nico: asValue('nico'),
  }); */

  return opts.next({
    ctx: {
      headers: ctx.headers,
      requestContext: { userId, requestId },
    },
  });
});

const { router, procedure } = t;

export { trpcExpress, procedure, router, t, protectedProcedure };
