import { UserService } from './Application';
import { UserController } from './Infrastructure/Controllers/User.controller';
import { UserRepositoryImplementation } from './Infrastructure/UserRepository.implementation.localDB';

const userRepository = new UserRepositoryImplementation();
const userService = new UserService(userRepository);
export const userController = new UserController(userService);
