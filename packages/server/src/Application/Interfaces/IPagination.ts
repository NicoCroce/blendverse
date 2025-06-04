export interface IPagination {
  page?: string;
  limit?: string;
}

export interface IPaginationResponse<T> {
  data: T;
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}
