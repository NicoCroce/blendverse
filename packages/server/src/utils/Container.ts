import { asClass, createContainer, InjectionMode } from 'awilix';
import { RequestContext } from '../Application/Entities/RequestContext';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});

container.register({
  requestContext: asClass(RequestContext).scoped(),
});

const createScope = () => container.createScope();

export { container, createScope };
