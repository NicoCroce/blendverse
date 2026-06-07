import { createContainer, InjectionMode } from 'awilix';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});

export { container };
