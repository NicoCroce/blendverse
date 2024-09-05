import { TRequestContext } from '../Entities';

type IexecuteService<TInput, TService> = (
  input: TInput,
  requestContext: TRequestContext,
) => TService;

interface IRequest<TInput> {
  ctx: {
    requestContext: TRequestContext;
  };
  input: TInput;
}

export const executeService =
  <TInput, TService>(service: IexecuteService<TInput, TService>) =>
  async ({ ctx, input }: IRequest<TInput>) => {
    return await service(input, ctx.requestContext);
  };

/** Service alone */

interface IRequestAlone {
  ctx: {
    requestContext: TRequestContext;
  };
  input: undefined;
}

type TexecuteServiceAlone<TService> = (
  requestContext: TRequestContext,
) => TService;

export const executeServiceAlone = <TService>(
  service: TexecuteServiceAlone<TService>,
) => {
  return async function ({ ctx }: IRequestAlone) {
    return await service(ctx.requestContext);
  };
};
