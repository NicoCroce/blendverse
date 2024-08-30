export interface IUseCase<TOutput = void, TInput = unknown> {
  execute(input?: TInput): Promise<TOutput>;
}
