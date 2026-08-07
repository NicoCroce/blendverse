/**
 * Interfaces de argumentos de los templates de email.
 * Cada template recibe un objeto tipado y devuelve { subject, body }.
 */

export interface IAddLicense {
  currentUser: string;
  reason: string;
}

export interface IDocumentSignedAdmin {
  employeeName: string;
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

export interface IDocumentSignedEmployee {
  employeeName: string;
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

export interface ILicenseStatusChange {
  employeeName: string;
  reviewerName: string;
  licenseType: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  reason: string;
  status: 'aprobado' | 'rechazado';
}

export interface IDisclaimerReminder {
  employeeName: string;
  disclaimerText: string;
  companyName: string;
}

export interface IDailyReport {
  companyName: string;
  date: string;
  sections: {
    employeesOnLeaveToday: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        startDate: string;
        endDate: string;
        returnDate: string;
      }>;
      totalCount: number;
    };
    pendingLicenses: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        startDate: string;
        daysSinceRequest: number;
      }>;
      totalCount: number;
    };
    unsignedDocuments: {
      items: Array<{
        documentTitle: string;
        employeeName: string;
        viewStatus: string;
      }>;
      totalCount: number;
    };
    pendingDisclaimerAcceptances: {
      items: Array<{ employeeName: string }>;
      totalCount: number;
    };
    upcomingVacations: {
      items: Array<{
        employeeName: string;
        segmentName: string | null;
        startDate: string;
        endDate: string;
      }>;
      totalCount: number;
    };
    expiringLicenses: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        endDate: string;
      }>;
      totalCount: number;
    };
    statisticalSummary: {
      activeEmployees: number;
      licensesInProgress: number;
      pendingLicenses: number;
      unsignedDocuments: number;
      pendingDisclaimerAcceptances: number;
    };
  };
}
