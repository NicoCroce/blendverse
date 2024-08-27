import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

// created for each request
export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions) => {
  console.log(`🟢 ${req.method} : ${req.path} => params: `, req.query);
  return {};
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
const { router, procedure } = t;

export { trpcExpress, procedure, router, t };
