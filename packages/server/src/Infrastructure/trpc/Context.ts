import { asValue, createContainer, InjectionMode } from 'awilix';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});

export const setScope = () => container.createScope();

export const getContainer = () => container;

export const registerContainer = (id: number = 0) =>
  container.register({
    userId: asValue(id),
  });
