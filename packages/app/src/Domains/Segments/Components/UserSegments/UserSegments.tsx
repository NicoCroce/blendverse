import { useState, useMemo } from 'react';
import { Container, EmptyScreenError, useDevice } from '@app/Application';
import { TooltipProvider } from '@app/Application/Components/ui/tooltip';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { DataTablePagination } from '@app/Application/Components/Organisms/DataCollection/DataTablePagination';
import { useGetSegmentTypes } from '../../Hooks/useGetSegmentTypes';
import { useGetEmployees } from '@app/Domains/Admin';
import { useURLParams } from '@app/Application/Hooks/useURLParams';
import type { TPagination, IPaginationPages } from '@app/Application/Helpers';
import { UserSegmentsStats } from './UserSegmentsStats';
import { UserSegmentsToolbar } from './UserSegmentsToolbar';
import { UserSegmentsTable } from './UserSegmentsTable';
import {
  UserSegmentsCards,
  UserSegmentsCardsSkeleton,
} from './UserSegmentsCards';
import { UserSegmentsEmptyState } from './UserSegmentsEmptyState';
import { UserSegmentSheet } from './UserSegmentSheet';
import type { Employee } from './types';

type UserSegmentsQuery = TPagination & { segmentos?: string };

export const UserSegments = () => {
  const [search, setSearch] = useState('');
  const [withoutSegments, setWithoutSegments] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

  const { isMobile } = useDevice();

  const { searchParams } = useURLParams<UserSegmentsQuery>();
  const page = searchParams?.page ?? '1';
  const limit = searchParams?.limit ?? '10';

  const segmentFilter = useMemo(() => {
    const raw = searchParams?.segmentos;
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n));
  }, [searchParams?.segmentos]);

  const {
    data: paginated,
    isLoading,
    isError,
    error,
  } = useGetEmployees()(
    {
      search,
      page,
      limit,
      withoutSegments,
      segmentIds: segmentFilter.length > 0 ? segmentFilter : undefined,
    },
    { refetchOnMount: 'always' },
  );

  const { data: unfilteredEmployees } = useGetEmployees()(
    { page: '1', limit: '1' },
    { refetchOnMount: 'always' },
  );

  const { data: allSegmentTypes } = useGetSegmentTypes();

  const employees: Employee[] = paginated?.data ?? [];

  const paginationMeta: IPaginationPages = useMemo(
    () =>
      paginated?.meta ?? {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        hasMore: false,
      },
    [paginated],
  );

  const totalSegmentTypes = allSegmentTypes?.length ?? 0;

  return (
    <TooltipProvider>
      <Container space="medium">
        <UserSegmentsStats
          totalEmployees={unfilteredEmployees?.meta?.totalItems ?? 0}
          totalItems={paginationMeta.totalItems}
          totalSegmentTypes={totalSegmentTypes}
          segmentFilterLength={segmentFilter.length}
        />

        <UserSegmentsToolbar
          search={search}
          onSearchChange={setSearch}
          withoutSegments={withoutSegments}
          onWithoutSegmentsChange={setWithoutSegments}
        />

        {isError ? (
          <EmptyScreenError message={error?.message} />
        ) : isLoading ? (
          isMobile ? (
            <UserSegmentsCardsSkeleton />
          ) : (
            <DataTable.Skeleton />
          )
        ) : employees.length > 0 ? (
          isMobile ? (
            <>
              <UserSegmentsCards
                employees={employees}
                onSelectUser={setSelectedUser}
              />
              <DataTablePagination
                totalPages={paginationMeta.totalPages}
                totalItems={paginationMeta.totalItems}
              />
            </>
          ) : (
            <UserSegmentsTable
              employees={employees}
              paginationMeta={paginationMeta}
              onSelectUser={setSelectedUser}
            />
          )
        ) : (
          <UserSegmentsEmptyState
            hasSearch={search.length > 0}
            searchTerm={search}
            hasSegmentFilter={segmentFilter.length > 0}
            withoutSegments={withoutSegments}
          />
        )}

        {selectedUser && (
          <UserSegmentSheet
            user={selectedUser}
            open
            onOpenChange={(open) => {
              if (!open) setSelectedUser(null);
            }}
          />
        )}
      </Container>
    </TooltipProvider>
  );
};
