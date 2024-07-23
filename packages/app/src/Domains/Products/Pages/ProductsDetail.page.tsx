import { useParams } from 'react-router-dom';
import { useGetProductDetail } from '../Hooks/useGetProductDetail';
import { ProductItem } from '../Components/ProductItem';
import { useUpdateStock } from '../Hooks/useUpdateStock';

export const ProductsDetailPage = () => {
  const { id } = useParams();
  const currentProduct = useGetProductDetail(id);
  const { handleStockChange } = useUpdateStock();

  if (!currentProduct || !id) return <h2>Producto no encontrado</h2>;

  const { name, description, stock } = currentProduct;

  return (
    <ProductItem
      id={id}
      name={name}
      description={description}
      stock={stock}
      handleStockChange={handleStockChange}
    />
  );
};
