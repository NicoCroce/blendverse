import { loggerContext } from '@server/utils/pino';
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

/**
 * Description placeholder
 *
 * @template TInput
 * @template TService
 * @param {IexecuteService<TInput, TService>} service
 * @returns {({ ctx, input }: IRequest<TInput>) => unknown}
 * @this remember bind the service.
 * @example executeService(this.usersService.getUser.bind(this.usersService))
 */

export const executeService =
  <TInput, TService>(service: IexecuteService<TInput, TService>) =>
  async ({ ctx, input }: IRequest<TInput>) => {
    loggerContext({ ...ctx.requestContext, input: JSON.stringify(input) }).info(
      'Service Input',
    );
    const response = await service(input, ctx.requestContext);
    loggerContext(ctx.requestContext).info(
      'Service Response => ' + JSON.stringify(response),
    );
    return response;
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

/**
 * Description placeholder
 *
 * @template TService
 * @param {TexecuteServiceAlone<TService>} service
 * @returns {({ ctx }: IRequestAlone) => unknown}
 * @this bind remember bind the service.
 * @example executeServiceAlone(this.usersService.getAllUsers.bind(this.usersService))
 */

export const executeServiceAlone = <TService>(
  service: TexecuteServiceAlone<TService>,
) => {
  return async function ({ ctx }: IRequestAlone) {
    const response = await service(ctx.requestContext);
    loggerContext(ctx.requestContext).info(
      'Service response => ' + JSON.stringify(response),
    );
    return response;
  };
};
