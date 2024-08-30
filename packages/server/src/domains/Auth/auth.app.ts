import { AuthService } from './Application';
import { AuthController, AuthRepositoryImplementation } from './Infrastructure';

const authRepository = new AuthRepositoryImplementation();
const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);
