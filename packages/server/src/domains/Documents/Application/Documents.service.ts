import { executeUseCase } from '@server/Application';
import {
  GetDocument,
  GetDocuments,
  GetDocumentsByCompany,
  GetStatisticsDocuments,
  SendDocumentToEmail,
  SignDocument,
  ViewDocument,
} from './UseCases';
import {
  IGetDocument,
  IGetDocuments,
  IGetDocumentsByCompany,
  IGetStatisticsDocuments,
  IGetStatisticsDocumentsResponse,
  ISendDocumentToEmail,
  ISignDocument,
  IViewDocument,
} from './documents.types';
import { SendEmailService } from '@server/Application/Services/SendEmail.service';
import axios from 'axios';

export class DocumentsService {
  constructor(
    private readonly _getDocuments: GetDocuments,
    private readonly _getDocument: GetDocument,
    private readonly _signDocument: SignDocument,
    private readonly _viewDocument: ViewDocument,
    private readonly _getDocumentsByCompany: GetDocumentsByCompany,
    private readonly _getStatisticsDocuments: GetStatisticsDocuments,
    private readonly _sendDocumentToEmail: SendDocumentToEmail,
    private readonly sendEmailService: SendEmailService,
  ) {}

  getDocuments({ input, requestContext }: IGetDocuments) {
    return executeUseCase({
      useCase: this._getDocuments,
      input,
      requestContext,
    });
  }

  getDocument({ input, requestContext }: IGetDocument) {
    return executeUseCase({
      useCase: this._getDocument,
      input,
      requestContext,
    });
  }

  async signDocument({ input, requestContext }: ISignDocument) {
    const documentId = await executeUseCase({
      useCase: this._signDocument,
      input,
      requestContext,
    });

    const { agreement, reasonSignatureNonConformity } = input;

    void this.sendEmailService
      .signDocument({
        documentId,
        agreement,
        reasonSignatureNonConformity,
        requestContext,
      })
      .catch(() => undefined);

    return documentId;
  }

  viewDocument({ input, requestContext }: IViewDocument) {
    return executeUseCase({
      useCase: this._viewDocument,
      input,
      requestContext,
    });
  }

  async getDocumentsByCompany({
    input,
    requestContext,
  }: IGetDocumentsByCompany) {
    return executeUseCase({
      useCase: this._getDocumentsByCompany,
      input,
      requestContext,
    });
  }

  async sendDocumentToEmail({ input, requestContext }: ISendDocumentToEmail) {
    const document = await executeUseCase({
      useCase: this._sendDocumentToEmail,
      input,
      requestContext,
    });

    const fileUrl = document.values.file as string;
    const response = await axios.get<ArrayBuffer>(fileUrl, {
      responseType: 'arraybuffer',
    });
    const pdfBuffer = Buffer.from(response.data);

    await this.sendEmailService.sendDocumentToEmail({
      documentId: document.values.id,
      documentTitle: document.values.title,
      pdfBuffer,
      requestContext,
    });

    return document.values;
  }

  async getStatisticsDocuments({
    requestContext,
  }: IGetStatisticsDocuments): Promise<IGetStatisticsDocumentsResponse> {
    return executeUseCase({
      useCase: this._getStatisticsDocuments,
      requestContext,
    });
  }
}
