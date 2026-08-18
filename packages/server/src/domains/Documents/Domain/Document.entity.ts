import { IDocument } from './Document.types';

export class Document {
  constructor(
    private readonly id: number,
    private readonly uploadDate: Date,
    private readonly title: string,
    private readonly file: unknown,
    private readonly signed: Date | null, // Si fue firmado.
    private readonly reasonSignatureNonConformity: string | null, // Descripción de por qué firma sin confirmidad.
    private readonly view: Date | null, // La fecha en que el usuario lo visualizó.
    private readonly type: string,
    private readonly requireSign: boolean, // Si el documento requiere ser firmado
    private readonly validationSign: string | null, //registra una huella perteneciente al usuario por cuestiones legales.
    private readonly agreedment: boolean | null, // si el documento requuiere firmar, lo hace bajo conformidad o no.
    private readonly user?: {
      id: number | null;
      name: string;
      surname: string;
    },
  ) {}

  static create({
    id,
    uploadDate,
    title,
    file,
    signed,
    reasonSignatureNonConformity,
    view,
    type,
    requireSign,
    validationSign,
    agreedment,
    user,
  }: IDocument): Document {
    return new Document(
      id,
      uploadDate,
      title,
      file,
      signed,
      reasonSignatureNonConformity,
      view,
      type,
      requireSign,
      validationSign,
      agreedment,
      user,
    );
  }

  toJSON() {
    return this.values;
  }

  get canDownload(): boolean {
    return this.signed !== null && this.agreedment === true;
  }

  get values() {
    return {
      id: this.id,
      uploadDate: this.uploadDate,
      title: this.title,
      file: this.file,
      signed: this.signed,
      reasonSignatureNonConformity: this.reasonSignatureNonConformity,
      view: this.view,
      type: this.type,
      requireSign: this.requireSign,
      validationSign: this.validationSign,
      agreedment: this.agreedment,
      canDownload: this.canDownload,
      user: this.user,
    };
  }
}
