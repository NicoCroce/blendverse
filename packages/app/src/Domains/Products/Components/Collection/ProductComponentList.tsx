import { format } from '@app/Aplication';
import { Badge } from '@app/Aplication/Components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@app/Aplication/Components/ui/card';
import { PRODUCTS_DETAIL_ROUTE } from '@app/Domains/Products/ProductsRoutes';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { TProduct } from '../../Product.entity';

export const ProductComponentList = ({ data }: { data: TProduct }) => {
  const { id, name, description, price, stock } = data;

  const detailPath = PRODUCTS_DETAIL_ROUTE.replace(':id', id);

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Link to={detailPath} className="absolute right-6 top-6">
          <FontAwesomeIcon icon={faEye} />
        </Link>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Badge variant="secondary">{stock}</Badge>
        <span>{format.ARS(price)}</span>
      </CardContent>
    </Card>
  );
};
