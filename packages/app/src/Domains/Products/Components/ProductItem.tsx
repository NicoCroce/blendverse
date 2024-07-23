import { FocusEventHandler, useState } from 'react';

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
    <ul>
      <li>ID: {id}</li>
      <li>NAME: {name}</li>
      <li>Description: {description}</li>
      <input
        type="number"
        name="stock"
        id="stock"
        min={0}
        value={newStock}
        onChange={({ target: { value } }) => setNewStock(Number(value))}
        onBlur={handleStockChange(id)}
      />
    </ul>
  );
};
