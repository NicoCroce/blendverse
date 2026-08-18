export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toPlural(str: string): string {
  if (
    str.endsWith('y') &&
    !['ay', 'ey', 'iy', 'oy', 'uy'].includes(str.slice(-2))
  ) {
    return str.slice(0, -1) + 'ies';
  }
  if (
    str.endsWith('s') ||
    str.endsWith('x') ||
    str.endsWith('z') ||
    str.endsWith('ch') ||
    str.endsWith('sh')
  ) {
    return str + 'es';
  }
  return str + 's';
}

export function toScreamingSnake(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
}

export interface NamingContext {
  Entity: string;
  Entities: string;
  Domain: string;
  domain: string;
  entity: string;
  entities: string;
  DOMAIN: string;
}

export function buildNamingContext(
  entityName: string,
  domainName?: string,
): NamingContext {
  const Entity = toPascalCase(entityName);
  const Entities = toPlural(Entity);
  const Domain = domainName ? toPascalCase(domainName) : Entities;
  const domain = toCamelCase(Domain);
  const entity = toCamelCase(Entity);
  const entities = toCamelCase(Entities);
  const DOMAIN = toScreamingSnake(Domain);

  return { Entity, Entities, Domain, domain, entity, entities, DOMAIN };
}
