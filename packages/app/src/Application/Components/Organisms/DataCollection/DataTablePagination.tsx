import { Container } from '../../Layout';
import { Button, Select, TOptions } from '../../Molecules';
import { usePagination } from '@app/Application/Hooks';
import { Badge } from '../../ui/badge';

const limitOptions: TOptions[] = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

interface DataTablePaginationProps {
  totalPages: number;
  totalItems: number;
}

export const DataTablePagination = ({
  totalPages,
  totalItems,
}: DataTablePaginationProps) => {
  'use no memo';
  const {
    currentPage,
    handleChangePage,
    handlePage,
    currentLimit,
    handleChangeLimit,
  } = usePagination(totalPages);

  return (
    <Container
      row
      justify="between"
      align="center"
      className="mt-4 border-t p-2 flex-wrap gap-2"
    >
      <Select
        options={limitOptions}
        placeholder="Resultados"
        onValueChange={handleChangeLimit}
        defaultValue={String(currentLimit)}
      />
      <Container row align="center" space="small" className="flex-wrap">
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
  );
};
