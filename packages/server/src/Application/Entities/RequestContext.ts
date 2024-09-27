export class RequestContext {
  constructor(
    private userId: number,
    private readonly requestId: string,
  ) {}

  setUserId(userId: number) {
    this.userId = userId;
  }

  get values() {
    return {
      userId: this.userId,
      requestId: this.requestId,
    };
  }
}
