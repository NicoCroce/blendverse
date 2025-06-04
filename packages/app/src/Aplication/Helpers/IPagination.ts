export type TPagination = {
  page?: string;
  limit?: string;
};

export interface IPaginationPages {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaginationResponse<T> {
  data: T[];
  pagination: IPaginationPages;
}

export const initPagination = { totalItems: 0, totalPages: 0, currentPage: 1 };

export type TupdateParamsPagination = (
  params: Partial<Record<'name' | keyof TPagination, string>>,
) => void;
