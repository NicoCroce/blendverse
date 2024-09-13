export class RequestContext {
  constructor(
    private userId: string,
    private readonly requestId: string,
  ) {}

  setUserId(userId: string) {
    this.userId = userId;
  }

  get values() {
    return {
      userId: this.userId,
      requestId: this.requestId,
    };
  }
}
