import { documentsController } from '../../documents.di';

export const DocumentsRoutes = () => {
  const {
    getDocuments,
    getDocument,
    viewDocument,
    signDocument,
    getDocumentsByCompany,
    getStatisticsDocuments,
    sendDocumentToEmail,
  } = documentsController();

  return {
    documents: {
      getAll: getDocuments,
      get: getDocument,
      sign: signDocument,
      view: viewDocument,
      getAllByCompany: getDocumentsByCompany,
      getStatistics: getStatisticsDocuments,
      sendToEmail: sendDocumentToEmail,
    },
  };
};
