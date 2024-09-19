import { loggerContext } from '@server/utils/pino';
import { RequestContext } from '../Entities';
import { IRequestContext } from '../Interfaces';

// Definimos un tipo auxiliar para el parámetro de IexecuteService
interface ServiceParams<TInput> {
  input: TInput;
  requestContext: RequestContext;
}

// Usamos el tipo auxiliar en IexecuteService
type IexecuteService<TInput, TService> = (
  params: ServiceParams<TInput>,
) => Promise<TService>;

interface IRequest<TInput> {
  ctx: {
    requestContext: RequestContext;
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
    const response = await service({
      input,
      requestContext: ctx.requestContext,
    });
    loggerContext(ctx.requestContext).info(
      'Service Response => ' + JSON.stringify(response),
    );
    return response;
  };

/** Service alone */

interface IRequestAlone {
  ctx: {
    requestContext: RequestContext;
  };
  input: undefined;
}

type TexecuteServiceAlone<TService> = ({
  requestContext,
}: IRequestContext) => Promise<TService>;

/**
 * Description placeholder
 *
 * @template TService
 * @param {TexecuteServiceAlone<TService>} service
 * @returns {({ ctx }: IRequestAlone) => unknown}
 * @this bind remember bind the service.
 * @example executeServiceAlone(this.usersService.getUsers.bind(this.usersService))
 */

export const executeServiceAlone = <TService>(
  service: TexecuteServiceAlone<TService>,
) => {
  return async function ({ ctx }: IRequestAlone) {
    const response = await service({ requestContext: ctx.requestContext });
    loggerContext(ctx.requestContext).info(
      'Service response => ' + JSON.stringify(response),
    );
    return response;
  };
};
