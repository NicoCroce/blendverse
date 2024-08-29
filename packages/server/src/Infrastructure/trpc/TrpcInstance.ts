import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyToken } from '../Auth/Auth';

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
  // `ctx.user` is nullable
  const token = verifyToken(ctx.headers);
  if (!token) {
    throw new TRPCError({
      message: 'Token not provided',
      code: 'UNAUTHORIZED',
    });
  }

  console.log('✅ TOKEN:', token);

  return opts.next({
    ctx: {
      // ✅ user value is known to be non-null now
      //user: ctx.user,
      headers: ctx.headers,
      // ^?
    },
  });
});

const { router, procedure } = t;

export { trpcExpress, procedure, router, t, protectedProcedure };
