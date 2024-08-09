import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from './ui/skeleton';

interface DataListProps<TData> {
  component: ({ data }: { data: TData }) => JSX.Element;
  data: TData[];
}

export const DataList = <TData,>({ data, component }: DataListProps<TData>) => {
  const Component = component;
  return (
    <ul className="flex flex-col gap-4">
      {data.map((currentData) => (
        <li key={uuidv4()}>
          <Component data={currentData} />
        </li>
      ))}
    </ul>
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
