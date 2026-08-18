export class RequestContext {
  constructor(
    private userId: number,
    private readonly requestId: string,
    private readonly ownerId: number,
    private xAppClient?: string,
  ) {}

  setUserId(userId: number) {
    this.userId = userId;
  }

  get values() {
    return {
      userId: this.userId,
      requestId: this.requestId,
      ownerId: this.ownerId,
      xAppClient: this.xAppClient,
    };
  }
}
