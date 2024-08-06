import { useEffect, useState } from 'react';
import { ProductsServices } from '../Services';

type TProduct = {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
};

export const useGetProductDetail = (id: string) => {
  const [currentProduct, setCurrentProduct] = useState<TProduct | null>(null);
  const queryProductDetail = ProductsServices.getProduct.useQuery(id, {
    enabled: false,
  });

  const { isFetched, isFetching, refetch } = queryProductDetail;

  const cacheProductsList = ProductsServices.useUtils().getProducts;

  useEffect(() => {
    // Extraemos los datos de la caché una vez al inicio del useEffect
    const cachedProduct =
      cacheProductsList.getData()?.find((product) => product.id === id) || null;

    if (cachedProduct) {
      setCurrentProduct(cachedProduct);
    } else if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentProduct(res.data || null);
      });
    }
  }, [id, cacheProductsList, isFetching, isFetched, refetch]);

  return {
    currentProduct,
    ...queryProductDetail,
  };
};
