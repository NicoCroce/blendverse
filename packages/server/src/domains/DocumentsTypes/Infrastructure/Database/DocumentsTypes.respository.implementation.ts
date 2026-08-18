import {
  DocumentsTypeRepository,
  DocumentType,
  //IGetDocumentsTypesRepository,
} from '../../Domain';
import {
  DocumentsTypesModel,
  DocumentsTypesModelAttributes,
} from './DocumentsTypes.model';

export class DocumentsTypesRespositoryImplementation implements DocumentsTypeRepository {
  async getDocumentsTypes() //params: IGetDocumentsTypesRepository,
  : Promise<DocumentType[]> {
    const documentsTypes = await DocumentsTypesModel.findAll({
      attributes: [
        'id',
        'denominacion',
        'requiere_firma',
      ] as DocumentsTypesModelAttributes,
    });

    return documentsTypes.map(({ id, denominacion, requiere_firma }) =>
      DocumentType.create({
        id,
        denomination: denominacion,
        signRequired: requiere_firma,
      }),
    );
  }
}
