import { axios } from '@server/Infrastructure/utils/axios';
import { AuthRepository, IRestorePasswordRepository } from '../../Domain';

const RESTORE_PASSWORD_ENDPOINT = '/nuevousuario/sendReestablecer';

export class AuthRepositoryImplementation implements AuthRepository {
  async restorePassword({
    mail,
    requestContext,
  }: IRestorePasswordRepository): Promise<void> {
    await axios.post(
      RESTORE_PASSWORD_ENDPOINT,
      { email: mail },
      {
        headers: {
          ...(requestContext?.values?.xAppClient && {
            'x-app-client': requestContext.values.xAppClient,
          }),
        },
      },
    );
  }
}
