import { v4 as uuidv4 } from 'uuid';

export type TRequestContext = {
  userId: string;
  requestId: string;
};
export class RequestContext {
  private userId: string;
  private requestId: string;

  constructor() {
    this.userId = uuidv4();
    this.requestId = ''; // Puedes inicializarlo aquí o pasarlo como parámetro en el constructor
  }

  setValues(userId: string, requestId: string) {
    this.userId = userId;
    this.requestId = requestId;
  }

  get values(): TRequestContext {
    return {
      userId: this.userId,
      requestId: this.requestId,
    };
  }
}
