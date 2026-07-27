import { useState, useMemo, useCallback } from 'react';
import { useURLParams } from '@app/Application/Hooks/useURLParams';
import { TPagination } from '@app/Application/Helpers';
import { employeeColumns } from './columns';
import {
  useGetEmployees,
  useSendReminders,
} from '@app/Domains/Disclaimer/hooks/useDisclaimer';

export const useEmpleadosPage = () => {
  const [search, setSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { searchParams } = useURLParams<TPagination>();
  const page = searchParams?.page ?? '1';
  const limit = searchParams?.limit ?? '10';

  const { data: paginated, isLoading } = useGetEmployees()(
    { search, page, limit },
    { refetchOnMount: 'always' },
  );

  const sendReminders = useSendReminders();

  const employees = useMemo(() => paginated?.data ?? [], [paginated]);

  const paginationMeta = useMemo(
    () =>
      paginated?.meta ?? {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        hasMore: false,
      },
    [paginated],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleToggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === employees.length) {
        return new Set();
      }
      return new Set(employees.map((e) => e.id));
    });
  }, [employees]);

  const handleActivateSelection = useCallback(() => {
    setSelectionMode(true);
    const pendingIds = new Set(
      employees.filter((e) => e.estado_firma === 'Pendiente').map((e) => e.id),
    );
    setSelectedIds(pendingIds);
  }, [employees]);

  const handleConfirmReminders = useCallback(() => {
    if (selectedIds.size === 0) return;
    sendReminders.mutate(
      { employeeIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setSelectionMode(false);
          setSelectedIds(new Set());
        },
      },
    );
  }, [selectedIds, sendReminders]);

  const columns = useMemo(
    () =>
      employeeColumns({
        selectionMode,
        selectedIds,
        onToggleSelection: handleToggleSelection,
        onToggleAll: handleToggleAll,
      }),
    [selectionMode, selectedIds, handleToggleSelection, handleToggleAll],
  );

  return {
    search,
    handleSearch,
    selectionMode,
    selectedIds,
    handleActivateSelection,
    handleConfirmReminders,
    sendReminders,
    employees,
    paginationMeta,
    columns,
    isLoading,
  };
};
