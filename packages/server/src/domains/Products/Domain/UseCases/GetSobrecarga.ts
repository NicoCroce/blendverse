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
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    input: string,
    requestContext: TRequestContext,
  ): Promise<ExecuteReturn> {
    const userId = requestContext.userId;
    const requestId = requestContext.requestId;
    logReqId('UseCase', { requestId, userId, input });
    await delay(3000);
    return {
      requestId,
      userId,
      input,
    };
  }
}
