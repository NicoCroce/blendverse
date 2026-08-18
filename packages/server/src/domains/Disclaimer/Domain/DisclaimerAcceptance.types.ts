export interface IDisclaimerAcceptance {
  id_usuario: number;
  id_empresa: number;
  hash_prueba: string;
  ip: string;
  user_agent: string | null;
  timestamp: Date | string;
  /** Nullable only while reading legacy rows during staged migration. */
  terms_version_id?: number | null;
  id?: number;
}
