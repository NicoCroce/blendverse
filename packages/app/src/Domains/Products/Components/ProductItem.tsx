import { FocusEventHandler, useState } from 'react';
import { Badge } from '@app/Aplication/Components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@app/Aplication/Components/ui/card';
import { Input } from '@app/Aplication/Components/ui/input';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

interface ProductItemProps {
  id: string;
  name: string;
  description: string;
  stock: number;
  handleStockChange(id: string): FocusEventHandler;
}

export const ProductItem = ({
  id,
  name,
  description,
  stock,
  handleStockChange,
}: ProductItemProps) => {
  const [newStock, setNewStock] = useState(stock);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input
          className="w-[50%]"
          type="number"
          name="stock"
          id="stock"
          min={0}
          value={newStock}
          onChange={({ target: { value } }) => setNewStock(Number(value))}
          onBlur={handleStockChange(id)}
        />
        <Badge variant="secondary" className="w-[50%]">
          ID: {id}
        </Badge>
      </CardContent>
    </Card>
  );
};

export const ProductItemSkeleton = () => (
  <Skeleton className="h-[125px] w-[100%] rounded-xl" />
);
