export interface IUseCase<TOutput = void> {
  execute(input: unknown): Promise<TOutput>;
}
