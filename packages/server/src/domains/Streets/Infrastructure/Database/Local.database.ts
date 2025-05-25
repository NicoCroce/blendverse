import { Streets } from '@server/data';
import { delay } from '@server/utils/Utils';

export class LocalDatabaseStreets {
  getAll = async (filters: string | undefined) => {
    await delay();

    if (!filters) return Streets;

    return Streets.filter(({ denominacion }) =>
      denominacion.toLowerCase().includes((filters || '').toLowerCase()),
    ).slice(0, 10);
  };
}
