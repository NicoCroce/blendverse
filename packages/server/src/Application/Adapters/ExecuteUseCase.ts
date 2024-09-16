import { loggerContextInput } from '@server/utils/pino';
import { RequestContext } from '../Entities';
import { IUseCase } from '../Interfaces';
import { TRPCErrorAdapter } from './TRPCErrorAdapter';

interface IExecuteUseCase<TOutput, TInput> {
  useCase: IUseCase<TOutput, TInput>;
  input?: TInput;
  requestContext: RequestContext;
  /** Use this if you don't want to show the whole input   */
  inputLog?: unknown;
}

/**
 * Description placeholder
 *
 * @async
 * @template [TOutput=void]
 * @template [TInput=unknown]
 * @param {IExecuteUseCase<TOutput, TInput>} param0
 * @param {IUseCase<TOutput, TInput>} param0.useCase
 * @param {TInput} param0.input
 * @param {RequestContext} param0.requestContext
 * @param {unknown} param0.inputLog Use this if you don't want to show the whole input in logger
 * @returns {Promise<TOutput>}
 */

export const executeUseCase = async <TOutput = void, TInput = unknown>({
  useCase,
  input,
  requestContext,
  /** Use this if you don't want to show the whole input in logger  */
  inputLog,
}: IExecuteUseCase<TOutput, TInput>): Promise<TOutput> => {
  const errorAdapter = new TRPCErrorAdapter();
  try {
    loggerContextInput(requestContext || {}, inputLog || input).info(
      `Execute usecase: ${useCase.constructor.name}`,
    );
    return await useCase.execute({ input, requestContext });
  } catch (error) {
    throw errorAdapter.adapt(error, requestContext);
  }
};
