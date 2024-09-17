import { useEffect, useMemo, useState } from 'react';
import { ProductsService } from '../ProductsService';
import { useCacheProducts } from './useCacheProducts';
import { TProduct } from '../Product.entity';

export const useGetProductDetail = (id: string) => {
  const [currentProduct, setCurrentProduct] = useState<TProduct | null>(null);
  const queryProductDetail = ProductsService.get.useQuery(id, {
    enabled: false,
  });
  const cacheProductsList = useCacheProducts();
  const { isFetched, isFetching, refetch } = queryProductDetail;

  // Extraemos los datos de la caché si es que existe.
  const cachedProduct = useMemo(
    () =>
      cacheProductsList.getData()?.find((product) => product.id === id) || null,
    [cacheProductsList, id],
  );

  useEffect(() => {
    // Si el producto está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedProduct) {
      setCurrentProduct(cachedProduct);
    } else if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentProduct(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedProduct]);

  return {
    currentProduct,
    ...queryProductDetail,
  };
};
