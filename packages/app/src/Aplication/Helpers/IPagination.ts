export type TPagination = {
  page?: string;
  limit?: string;
};

export interface IPaginationPages {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export interface IPaginationResponse<T> {
  data: T[];
  meta: IPaginationPages;
}

export const initPagination = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  hasMore: false,
};

export type TupdateParamsPagination = (
  params: Partial<Record<'name' | keyof TPagination, string>>,
) => void;
