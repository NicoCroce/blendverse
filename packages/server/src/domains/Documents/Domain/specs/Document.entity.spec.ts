import { describe, expect, it } from 'vitest';
import { Document } from '../Document.entity';

describe('Document entity — canDownload', () => {
  it('returns false when document is unsigned (signed=null)', () => {
    const doc = Document.create({
      id: 1,
      uploadDate: new Date(),
      title: 'Test',
      file: 'https://example.com/doc.pdf',
      signed: null,
      reasonSignatureNonConformity: null,
      view: null,
      type: 'recibo',
      requireSign: true,
      validationSign: null,
      agreedment: null,
    });

    expect(doc.canDownload).toBe(false);
    expect(doc.values.canDownload).toBe(false);
  });

  it('returns false when signed without conformity (agreedment=false)', () => {
    const doc = Document.create({
      id: 2,
      uploadDate: new Date(),
      title: 'Test',
      file: 'https://example.com/doc.pdf',
      signed: new Date(),
      reasonSignatureNonConformity: 'No estoy de acuerdo',
      view: null,
      type: 'recibo',
      requireSign: true,
      validationSign: 'hash123',
      agreedment: false,
    });

    expect(doc.canDownload).toBe(false);
    expect(doc.values.canDownload).toBe(false);
  });

  it('returns true when signed with conformity (agreedment=true)', () => {
    const doc = Document.create({
      id: 3,
      uploadDate: new Date(),
      title: 'Test',
      file: 'https://example.com/doc.pdf',
      signed: new Date(),
      reasonSignatureNonConformity: null,
      view: null,
      type: 'recibo',
      requireSign: true,
      validationSign: 'hash123',
      agreedment: true,
    });

    expect(doc.canDownload).toBe(true);
    expect(doc.values.canDownload).toBe(true);
  });

  it('returns false when agreedment is null even if signed', () => {
    const doc = Document.create({
      id: 4,
      uploadDate: new Date(),
      title: 'Test',
      file: 'https://example.com/doc.pdf',
      signed: new Date(),
      reasonSignatureNonConformity: null,
      view: null,
      type: 'recibo',
      requireSign: true,
      validationSign: 'hash123',
      agreedment: null,
    });

    expect(doc.canDownload).toBe(false);
  });
});
