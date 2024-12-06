export class RequestContext {
  constructor(
    private userId: number,
    private readonly requestId: string,
    private ownerId: number,
  ) {}

  setUserId(userId: number) {
    this.userId = userId;
  }

  setOwerId(ownerId: number) {
    this.ownerId = ownerId;
  }

  get values() {
    return {
      userId: this.userId,
      requestId: this.requestId,
      ownerId: this.ownerId,
    };
  }
}
