import { documentsTypesController } from '../../documentstypes.di';

export const DocumentsTypesRoutes = () => {
  const { getDocumentsTypes } = documentsTypesController();

  return {
    documentsType: {
      getAll: getDocumentsTypes,
    },
  };
};
