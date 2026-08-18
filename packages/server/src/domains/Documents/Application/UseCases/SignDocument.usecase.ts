import { AppError, executeUseCase, IUseCase } from '@server/Application';
import { DocumentRepository } from '../../Domain/Document.repository';
import { ISignDocument } from '../documents.types';
import { ValidateUserPassword } from '@server/domains/Auth';

export class SignDocument implements IUseCase<number> {
  constructor(
    private readonly documentsRepository: DocumentRepository,
    private readonly _validateUserPassword: ValidateUserPassword,
  ) {}

  async execute({ input, requestContext }: ISignDocument): Promise<number> {
    const user = await executeUseCase({
      useCase: this._validateUserPassword,
      input: {
        id: requestContext.values.userId,
        password: input.password,
      },
      requestContext,
    });

    const document = await this.documentsRepository.signDocument({
      id: input.documentId,
      validationSign: user.password || '',
      requestContext,
      agreement: input.agreement,
      reasonSignatureNonConformity: input.reasonSignatureNonConformity || null,
    });

    if (!document) {
      throw new AppError('No se puede firmar el documento');
    }

    return input.documentId;
  }
}
