import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductDetail } from '../Hooks/useGetProductDetail';
import { ProductItem, ProductItemSkeleton } from '../Components/ProductItem';
import { useUpdateStock } from '../Hooks/useUpdateStock';
import { Page } from '@app/Aplication/Components/Page/Page';
import { toast } from 'sonner';
import { PRODUCTS_ROUTE } from '../ProductsRoutes';
import { useEffect } from 'react';

export const ProductsDetailPage = () => {
  const { id = '' } = useParams();
  const { currentProduct, isError, isLoading } = useGetProductDetail(id);
  const { handleStockChange } = useUpdateStock();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toast.error('Producto no encontrado');
      navigate(PRODUCTS_ROUTE);
    }
  }, [navigate, isError]);

  const RenderItem = () => {
    if (!currentProduct) return null;
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

  return (
    <Page title="Detalle de producto">
      {isLoading ? <ProductItemSkeleton /> : <RenderItem />}
    </Page>
  );
};
