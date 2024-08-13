import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Page } from '@app/Aplication/Components';
import { toast } from 'sonner';

import { useUpdateStock, useGetProductDetail } from '../Hooks';
import { PRODUCTS_ROUTE } from '../ProductsRoutes';
import { ProductItem, ProductItemSkeleton } from '../Components/ProductItem';

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
    <Page title="Detalle de producto" size="small">
      {isLoading ? <ProductItemSkeleton /> : <RenderItem />}
    </Page>
  );
};
