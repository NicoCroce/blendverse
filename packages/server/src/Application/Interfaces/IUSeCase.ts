import { RequestContext } from '../Entities';

export interface IUseCase<TOutput = void, TInput = unknown> {
  execute(input?: TInput, requestContext?: RequestContext): Promise<TOutput>;
}
