import { loggerContextInput } from '@server/utils/pino';
import { RequestContext } from '../Entities';
import { IUseCase } from '../Interfaces/IUSeCase';
import { TRPCErrorAdapter } from './TRPCErrorAdapter';

/**
 * Description placeholder
 *
 * @async
 * @template [TOutput=void]
 * @template [TInput=unknown]
 * @param {IUseCase<TOutput, TInput>} useCase
 * @param {?TInput} [input]
 * @param {?RequestContext} [requestContext]
 * @param {?unknown} [inputLog] Use this if you don't want to show the whole input
 * @returns {unknown}
 */
export const executeUseCase = async <TOutput = void, TInput = unknown>(
  useCase: IUseCase<TOutput, TInput>,
  input?: TInput,
  requestContext?: RequestContext,
  /** Use this if you don't want to show the whole input   */
  inputLog?: unknown,
) => {
  const errorAdapter = new TRPCErrorAdapter();
  try {
    loggerContextInput(requestContext || {}, inputLog || input).info(
      `Execute usecase: ${useCase.constructor.name}`,
    );
    return await useCase.execute(input, requestContext);
  } catch (error) {
    throw errorAdapter.adapt(error, requestContext);
  }
};
