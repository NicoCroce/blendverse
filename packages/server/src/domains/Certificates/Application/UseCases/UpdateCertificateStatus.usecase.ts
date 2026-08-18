import { AppError, IUseCase, RequestContext } from '@server/Application';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import { IUpdateCertificateStatus } from '../certificates.types';
import { Certificate } from '../../Domain/Certificate.entity';
import { GetRoleByUser } from '@server/domains/Permissions/Application/UseCases/GetRoleByUser.usecase';
import { isAdminRole } from '@server/domains/Permissions/Domain';

export class UpdateCertificateStatus implements IUseCase<Certificate> {
  constructor(
    private readonly certificatesRepository: CertificateRepository,
    private readonly getRoleByUser: GetRoleByUser,
  ) {}

  async execute({
    input,
    requestContext,
  }: IUpdateCertificateStatus): Promise<Certificate> {
    const certificate = await this.certificatesRepository.getCertificate({
      id: input.id,
      requestContext,
    });

    if (!certificate) {
      throw new AppError('Certificado no encontrado', 404);
    }

    if (certificate.status === 'eliminado') {
      throw new AppError('No se puede modificar un certificado eliminado', 403);
    }

    const isAdmin = await this.checkAdmin(requestContext);

    if (!isAdmin) {
      throw new AppError(
        'No tienes permiso para cambiar el estado del certificado',
        403,
      );
    }

    return this.certificatesRepository.updateCertificateStatus({
      id: input.id,
      status: input.status,
      requestContext,
    });
  }

  private async checkAdmin(requestContext: RequestContext): Promise<boolean> {
    try {
      const roleName = await this.getRoleByUser.execute({
        input: requestContext.values.userId,
        requestContext,
      });
      return isAdminRole(roleName);
    } catch {
      return false;
    }
  }
}
