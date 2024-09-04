import { IUseCase, TRequestContext } from '@server/Application';
import { ProductsRepository } from '../Products.repository';
import { logReqId } from '@server/utils/logReqId';
import { delay } from '@server/utils/Utils';

interface ExecuteReturn {
  requestId: string;
  userId: string;
  input: string;
}

export class GetSobrecarga implements IUseCase<ExecuteReturn> {
  constructor(
    private readonly productRepository: ProductsRepository,
    private readonly requestContext: TRequestContext,
  ) {}

  async execute(input: string): Promise<ExecuteReturn> {
    const userId = this.requestContext.userId;
    const requestId = this.requestContext.requestId;
    logReqId('UseCase', { requestId, userId, input });
    await delay(3000);
    return {
      requestId,
      userId,
      input,
    };
  }
}
