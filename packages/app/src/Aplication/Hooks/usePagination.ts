import { useCallback } from 'react';
import { useURLParams } from './useURLParams';

export const usePagination = (totalPages: number) => {
  const { searchParams, updateParams } = useURLParams();
  const currentPage = Number(searchParams?.page) || 1;
  const currentLimit = Number(searchParams?.limit) || 10;

  const handleChangePage = useCallback(
    (page: number) => updateParams({ page: String(page) }),
    [updateParams],
  );

  const handlePage = {
    startPage: currentPage === 1,
    lastPage: currentPage === totalPages,
  };

  const handleChangeLimit = (limit: string) =>
    updateParams({ page: '1', limit });

  return {
    handleChangePage,
    currentPage,
    handlePage,
    currentLimit,
    handleChangeLimit,
  };
};
