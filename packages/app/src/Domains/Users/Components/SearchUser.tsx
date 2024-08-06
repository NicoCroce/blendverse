import { useState } from 'react';
import { Input } from '@app/Aplication/Components/ui/input';
import { Link, useMatch } from 'react-router-dom';
import { USERS_ROUTE, USERS_SEARCH_DETAIL_ROUTE } from '../UsersRoutes';
import { OutletSheet } from '@app/Aplication/Components/OutletSheet';
import { Button } from '@app/Aplication/Components';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const isInDetail = useMatch(USERS_SEARCH_DETAIL_ROUTE);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(
    !!isInDetail || false,
  );

  const to = (userId && USERS_SEARCH_DETAIL_ROUTE.replace(':id', userId)) || '';

  return (
    <div className="flex gap-4 items-stretch bg-white">
      <Input
        type="text"
        name="search"
        id=""
        value={userId}
        onChange={({ target }) => setUserId(target.value)}
        className="max-w-[300px]"
        placeholder="ID a buscar"
      />
      <Link to={to}>
        <Button>Search</Button>
      </Link>

      <OutletSheet
        open={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        navigateToOnClose={USERS_ROUTE}
      />
    </div>
  );
};
