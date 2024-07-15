export interface IErrorAdapter<T> {
  adapt(error: unknown): T;
}
