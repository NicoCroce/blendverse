import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
//const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
//export const router = t.router;
//export const publicProcedure = t.procedure;

// created for each request
export const createContext = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();
const { router, procedure } = t;

export { trpcExpress, procedure, router, t };
