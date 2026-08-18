/**
 * Tipos de los pendientes por empleado para el email diario.
 * DTOs de salida (no persistentes) del dominio EmployeeReminders.
 */

export interface PendingDocumentItem {
  documentId: number;
  documentTitle: string;
}

export interface EmployeePendingSection {
  /** Documentos con `firmado IS NULL` (pendientes de firma). */
  unsignedDocuments: PendingDocumentItem[];
  /** Documentos con `visualizado IS NULL` (pendientes de visualización). */
  unviewedDocuments: PendingDocumentItem[];
  /** Sin registro válido en disclaimer_firmas (estado_firma !== 'Firmado'). */
  pendingDisclaimerAcceptance: boolean;
  /** `usuarios.renovar_clave = true`. */
  renewPassword: boolean;
}
