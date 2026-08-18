import { AppError, IUseCase } from '@server/Application';
import { IAppendImages } from '../certificates.types';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import { Certificate } from '../../Domain/Certificate.entity';

export class AppendImages implements IUseCase<Certificate> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    input: { file, host, protocol, id },
    requestContext,
  }: IAppendImages): Promise<Certificate> {
    const userId = requestContext.values.userId;

    try {
      if (!file) throw new AppError('No se ha subido ningún archivo', 400);

      console.log('Archivo recibido:', file);

      // Construir URL para acceder al archivo
      const fileUrl = `${protocol}://${host}/uploads/${userId}/${file.filename}`;

      const arrayFiles = [];

      arrayFiles.push(fileUrl);

      try {
        const certificate = await this.certificatesRepository.appendImages({
          certificateId: id,
          files: arrayFiles,
          requestContext,
        });

        return certificate;
      } catch (error) {
        throw new AppError(
          `Error al vincular los archivos con el certificado => ${error}`,
        );
      }
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      throw new AppError('Error al procesar la subida del archivo');
    }
  }
}
