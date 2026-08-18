declare module 'sanitize-html' {
  interface SanitizeOptions {
    allowedTags?: readonly string[];
    allowedAttributes?: Record<string, readonly string[]>;
    allowedSchemes?: readonly string[];
    allowedSchemesByTag?: Record<string, readonly string[]>;
    disallowedTagsMode?:
      | 'discard'
      | 'completelyDiscard'
      | 'escape'
      | 'recursiveEscape';
  }

  const sanitizeHtml: (dirty: string, options?: SanitizeOptions) => string;
  export default sanitizeHtml;
}
