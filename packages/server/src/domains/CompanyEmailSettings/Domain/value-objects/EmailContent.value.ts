import crypto from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { CompanyEmailSettingsDomainError } from '../CompanyEmailSettings.errors';

const BASE_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['https'],
  allowedSchemesByTag: { a: ['https'] },
  disallowedTagsMode: 'discard',
} as const;

const normalize = (content: string): string =>
  content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

export const sanitizeContent = (
  content: string,
  maxLength: number,
  fieldName: string,
  allowBlank = false,
): string => {
  const sanitized = normalize(sanitizeHtml(content, BASE_OPTIONS));
  const text = sanitized.replace(/<[^>]*>/g, '').trim();

  if ((!allowBlank && text.length === 0) || sanitized.length > maxLength) {
    throw new CompanyEmailSettingsDomainError(
      `${fieldName} supera el formato o límite permitido`,
      400,
      'VALIDATION_ERROR',
    );
  }

  return sanitized;
};

export const contentHash = (content: string): string =>
  crypto.createHash('sha256').update(content).digest('hex');

export const sanitizeWelcomeMessage = (
  content: string | null,
): string | null =>
  content === null
    ? null
    : sanitizeContent(content, 2000, 'El mensaje de inicio');

export const sanitizeTermsContent = (content: string): string =>
  sanitizeContent(content, 50000, 'Los términos y condiciones', true);
