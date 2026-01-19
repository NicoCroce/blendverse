import { IPagination } from '@server/Application';
import z from 'zod';

export const paginationZodParams = {
  page: z.string().optional(),
  limit: z.string().optional(),
};

// Interfaz base más flexible que permite propiedades opcionales
interface PaginationFilters extends IPagination {
  [key: string]: string | undefined;
}

export const PaginationImplementation = <T = PaginationFilters>(
  filters?: T & IPagination,
) => {
  const page = Number(filters?.page) || 1;
  const limit = Number(filters?.limit) || 10;
  const offset = (page - 1) * limit;

  const createPaginatedResponse = <T>(data: T, totalItems: number) => {
    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        hasMore,
      },
    };
  };

  return {
    page,
    limit,
    offset,
    createPaginatedResponse,
  };
};
