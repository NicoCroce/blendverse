import { loggerContext } from '@server/Infrastructure/utils/pino';
import {
  ICookieResponse,
  setAuthCookie,
} from '@server/Infrastructure/utils/cookie';
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

interface IRequestWithCookie<TInput> {
  ctx: {
    requestContext: RequestContext;
    res: ICookieResponse;
  };
  input: TInput;
}

type IexecuteServiceWithCookie<TInput> = (
  params: ServiceParams<TInput>,
) => Promise<{ token: string; ownerId: number }>;

/**
 * Variant of executeService that sets an HttpOnly `auth_token` cookie from the
 * `token` field of the service response and returns `{ ownerId }`.
 * Use for procedures that need to update the session cookie (e.g. select-empresa).
 * @this bind the service method before passing it.
 * @example executeServiceWithCookie(this.service.selectEmpresa.bind(this.service))
 */
export const executeServiceWithCookie =
  <TInput>(service: IexecuteServiceWithCookie<TInput>) =>
  async ({ ctx, input }: IRequestWithCookie<TInput>) => {
    loggerContext({ ...ctx.requestContext, input: JSON.stringify(input) }).info(
      'Service Input (withCookie)',
    );
    const result = await service({ input, requestContext: ctx.requestContext });
    setAuthCookie(ctx.res, result.token);
    loggerContext(ctx.requestContext).info(
      'Service Response (withCookie) => ownerId: ' + result.ownerId,
    );
    return { ownerId: result.ownerId };
  };
