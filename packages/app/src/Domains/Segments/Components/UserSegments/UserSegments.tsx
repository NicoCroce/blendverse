import { useState, useMemo } from 'react';
import { Container } from '@app/Application';
import { TooltipProvider } from '@app/Application/Components/ui/tooltip';
import { useGetSegmentTypes } from '../../Application/segments.queries';
import { useGetEmployees } from '@app/Domains/Disclaimer/hooks/useDisclaimer';
import { useURLParams } from '@app/Application/Hooks/useURLParams';
import type { TPagination, IPaginationPages } from '@app/Application/Helpers';
import { UserSegmentsStats } from './UserSegmentsStats';
import { UserSegmentsToolbar } from './UserSegmentsToolbar';
import { UserSegmentsTable } from './UserSegmentsTable';
import { UserSegmentSheet } from './UserSegmentSheet';
import type { Employee } from './types';

type UserSegmentsQuery = TPagination & { segmentos?: string };

export const UserSegments = () => {
  const [search, setSearch] = useState('');
  const [withoutSegments, setWithoutSegments] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

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

  const { data: paginated, isLoading } = useGetEmployees()(
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

        <UserSegmentsTable
          employees={employees}
          isLoading={isLoading}
          paginationMeta={paginationMeta}
          onSelectUser={setSelectedUser}
          hasSearch={search.length > 0}
          searchTerm={search}
          hasSegmentFilter={segmentFilter.length > 0}
          withoutSegments={withoutSegments}
        />

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
