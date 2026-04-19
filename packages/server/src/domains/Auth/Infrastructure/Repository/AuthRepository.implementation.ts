import { axios } from '@server/utils/axios';
import { AuthRepository, IRestorePasswordRepository } from '../../Domain';

const RESTORE_PASSWORD_ENDPOINT = '/nuevousuario/sendReestablecer';

export class AuthRepositoryImplementation implements AuthRepository {
  async restorePassword({ mail }: IRestorePasswordRepository): Promise<void> {
    await axios.post(RESTORE_PASSWORD_ENDPOINT, { email: mail });
  }
}
