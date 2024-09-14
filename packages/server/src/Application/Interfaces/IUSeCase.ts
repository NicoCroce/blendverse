import { RequestContext } from '../Entities';

interface IExecuteParams<TInput> {
  input?: TInput;
  requestContext: RequestContext;
}

export interface IUseCase<TOutput = void, TInput = unknown> {
  execute({ input, requestContext }: IExecuteParams<TInput>): Promise<TOutput>;
}
