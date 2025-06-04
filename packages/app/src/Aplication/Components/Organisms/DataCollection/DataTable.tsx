import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@app/Aplication/Components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Skeleton } from '../../ui/skeleton';
import { Container } from '../../Layout';
import { Button, Select, TOptions } from '../../Molecules';
import { usePagination } from '@app/Aplication/Hooks';
import { IPaginationPages } from '@app/Aplication/Helpers';
import { Badge } from '../../ui/badge';

const limitOptions: TOptions[] = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: IPaginationPages;
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  pagination: { totalPages, totalItems },
}: DataTableProps<TData, TValue>) => {
  const {
    currentPage,
    handleChangePage,
    handlePage,
    currentLimit,
    handleChangeLimit,
  } = usePagination(totalPages);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Container row justify="between" className="mt-4 border-t p-2">
        <Select
          options={limitOptions}
          placeholder="Resultados"
          onValueChange={handleChangeLimit}
          defaultValue={String(currentLimit)}
        />
        <Container row>
          <Button
            onClick={() => handleChangePage(Number(currentPage) - 1)}
            disabled={handlePage.startPage}
            variant="outline"
          >
            {'<'}
          </Button>
          <Badge className="justify-center" variant="secondary">
            {currentPage === totalPages ? (
              <span>{currentPage}</span>
            ) : (
              <span>
                {currentPage} ... {totalPages}
              </span>
            )}
          </Badge>
          <Button
            onClick={() => handleChangePage(Number(currentPage) + 1)}
            disabled={handlePage.lastPage}
            variant="outline"
          >
            {'>'}
          </Button>
        </Container>
        <Badge variant="secondary">Total: {totalItems}</Badge>
      </Container>
    </div>
  );
};

export type TDataTable = typeof DataTable;

const SkeletonTable = () => (
  <Skeleton className="w-full h-[400px] rounded-xl" />
);

DataTable.Skeleton = SkeletonTable;
