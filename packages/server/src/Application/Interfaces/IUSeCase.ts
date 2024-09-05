import { TRequestContext } from '../Entities';

export interface IUseCase<TOutput = void, TInput = unknown> {
  execute(input?: TInput, requestContext?: TRequestContext): Promise<TOutput>;
}
