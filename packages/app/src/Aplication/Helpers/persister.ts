import { createIDBPersister } from './Indexdb';

export const persistOptions = {
  persister: createIDBPersister(),
  maxAge: Infinity,
};
