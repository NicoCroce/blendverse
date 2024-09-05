import { IncomingHttpHeaders } from 'http';
import { TRequestContext } from '../Entities';

type IexecuteService<TInput, TService> = (
  input: TInput,
  requestContext: TRequestContext,
) => TService;

interface IRequest<TInput> {
  ctx: {
    headers: IncomingHttpHeaders;
    requestContext: TRequestContext;
  };
  input: TInput;
}

export const executeService =
  <TInput, TService>(service: IexecuteService<TInput, TService>) =>
  async ({ ctx, input }: IRequest<TInput>) => {
    return await service(input, ctx.requestContext);
  };
