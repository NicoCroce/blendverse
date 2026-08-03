import { Op, WhereOptions } from 'sequelize';
import { Documentos } from './';
import { Literal } from 'sequelize/lib/utils';
import { IGetDocumentsRepository, TStateDocument } from '../../Domain';
import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infrastructure';

export const DocumentsFilters = (
  filters: IGetDocumentsRepository['filters'],
) => {
  const whereCondition: WhereOptions<Documentos> = {};
  const whereConditionSisTipoDocumentos: WhereOptions<DocumentsTypesModel> = {};

  if (filters.title) whereCondition.titulo = { [Op.substring]: filters.title };

  if (filters.signed)
    whereCondition.firmado = { [Op.not]: null as unknown as Literal };

  if (filters.view !== null)
    whereCondition.visualizado = filters.view === filters.view;

  if (filters.type)
    whereConditionSisTipoDocumentos.denominacion = { [Op.eq]: filters.type };

  if (filters.requireSign !== null)
    whereConditionSisTipoDocumentos.requiere_firma =
      filters.requireSign || false;

  const filterState: Record<TStateDocument, WhereOptions<Documentos>> = {
    validados: {
      [Op.or]: [
        {
          firmado: {
            [Op.not]: null, // Document signed
          },
        },
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': false }, // Doesn't require signature
            { visualizado: { [Op.not]: null } }, // And has been viewed
          ],
        },
      ],
    } as WhereOptions<Documentos>,
    pendientes: {
      [Op.or]: [
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': true },
            { firmado: { [Op.is]: null } },
          ],
        },
        {
          [Op.and]: [
            { '$DocumentsTypesModel.requiere_firma$': false },
            { visualizado: { [Op.is]: null } },
          ],
        },
      ],
    } as WhereOptions<Documentos>,
    bajo_conformidad: {
      [Op.and]: [
        { firmado: { [Op.not]: null } },
        { firma_bajo_acuerdo: { [Op.eq]: true } },
      ],
    } as WhereOptions<Documentos>,
    sin_conformidad: {
      [Op.and]: [
        { firmado: { [Op.not]: null } },
        { firma_bajo_acuerdo: { [Op.eq]: false } },
      ],
    } as WhereOptions<Documentos>,
  };

  const filterValidated: WhereOptions<Documentos> = filters.state
    ? filterState[filters.state]
    : {};

  return {
    whereCondition,
    whereConditionSisTipoDocumentos,
    filterValidated,
  };
};
