import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositorySource = readFileSync(
  resolve(
    process.cwd(),
    'src/domains/CompanyEmailSettings/Infrastructure/Database/CompanyEmailSettingsRepository.implementation.ts',
  ),
  'utf8',
);

describe('CompanyEmailSettings repository persistence contract', () => {
  it('scopes every aggregate collection and audit query by RequestContext ownerId', () => {
    expect(repositorySource).toContain(
      'const ownerId = this.ownerId(requestContext)',
    );
    expect(repositorySource).toContain('where: { owner_id: ownerId }');
    expect(repositorySource).toContain('owner_id: ownerId');
    expect(repositorySource).toContain('owner_id: ownerId');
    expect(repositorySource).toContain(
      'const ownerId = this.ownerId(params.requestContext)',
    );
  });

  it('uses idempotent lazy provisioning, hard-deletes collection rows, and rolls back failures', () => {
    expect(repositorySource).toContain('findOrCreate');
    expect(repositorySource).toContain('ignoreDuplicates: true');
    expect(repositorySource).toContain('force: true');
    expect(repositorySource).toContain('await transaction.rollback()');
    expect(repositorySource).toContain("action: 'lazy_provision'");
  });

  it('implements optimistic update and terms version/hash boundaries in the repository transaction', () => {
    expect(repositorySource).toContain(
      'where: { owner_id: ownerId, version: expectedVersion }',
    );
    expect(repositorySource).toContain("'STALE_CONFIGURATION'");
    expect(repositorySource).toContain(
      'const hash = contentHash(sanitizedContent)',
    );
    expect(repositorySource).toContain('DUPLICATE_TERMS_CONTENT');
    expect(repositorySource).toContain(
      'version_number: (latest?.version_number ?? 0) + 1',
    );
    expect(repositorySource).toContain('terms_version_before');
    expect(repositorySource).toContain('content_hash_after');
  });

  it('returns audit metadata without editable recipient or terms content payloads', () => {
    expect(repositorySource).toContain(
      'changedCodes: row.changed_codes ?? undefined',
    );
    expect(repositorySource).toContain(
      'contentHashBefore: row.content_hash_before',
    );
    expect(repositorySource).not.toContain('email: row.email');
    expect(repositorySource).not.toContain('content: row.content_html');
  });
});
