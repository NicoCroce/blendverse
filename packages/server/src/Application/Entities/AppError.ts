export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_SERVER_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}
