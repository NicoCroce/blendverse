import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from '../../ui/skeleton';
import { usePaginationIntersection } from '@app/Aplication/Hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface DataListProps<TData> {
  component: ({ data }: { data: TData }) => JSX.Element;
  data: TData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const DataList = <TData,>({
  data,
  component,
  onLoadMore,
  hasMore = true,
  isLoading = false,
}: DataListProps<TData>) => {
  const Component = component;

  // Usar el hook personalizado para manejar el scroll infinito
  const { observerRef } = usePaginationIntersection({
    hasMore,
    isLoading,
    onLoadMore,
  });

  return (
    <div className="mb-10">
      <ul className="flex flex-col gap-4">
        {data.map((currentData) => (
          <li key={uuidv4()}>
            <Component data={currentData} />
          </li>
        ))}
      </ul>

      {/* Elemento de observación para scroll infinito */}
      {hasMore && (
        <div
          ref={observerRef}
          className="h-4 flex justify-center items-center p-10"
        >
          {isLoading && <FontAwesomeIcon icon={faSpinner} size="2xl" spin />}
        </div>
      )}
    </div>
  );
};

const SkeletonDataList = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-full h-[150px] rounded-xl" />
    <Skeleton className="w-full h-[150px] rounded-xl" />
    <Skeleton className="w-full h-[150px] rounded-xl" />
    <Skeleton className="w-full h-[150px] rounded-xl" />
  </div>
);
DataList.Skeleton = SkeletonDataList;
