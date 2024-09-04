import { IUseCase } from '@server/Application';
import { ProductsRepository } from '../Products.repository';
import { logReqId } from '@server/utils/logReqId';
import { delay } from '@server/utils/Utils';

interface ExecuteReturn {
  requestId: string;
  userId: string;
  input: string;
}

export class GetSobrecargaParams implements IUseCase<ExecuteReturn> {
  constructor(private readonly productRepository: ProductsRepository) {}

  async execute(input: ExecuteReturn): Promise<ExecuteReturn> {
    const { requestId, userId, input: i } = input;
    logReqId('UseCase', { requestId, userId, input: i });
    await delay(3000);
    return {
      requestId,
      userId,
      input: i,
    };
  }
}
