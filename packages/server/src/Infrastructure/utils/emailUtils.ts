/**
 * Helpers de validación de email. Funciones puras sin dependencias
 * (ni Sequelize ni Nodemailer): viven en Infrastructure/utils.
 */

/**
 * Valida que un email tenga formato básico válido (no vacío y con @/dominio).
 * FR-009/FR-014: un empleado sin email válido se omite del envío.
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const trimmed = email.trim();
  if (trimmed === '') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};
