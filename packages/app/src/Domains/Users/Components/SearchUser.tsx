import { useState } from 'react';
import { Input } from '@app/Aplication/Components/ui/input';
import { useMatch, useNavigate } from 'react-router-dom';
import { USERS_ROUTE, USERS_SEARCH_DETAIL_ROUTE } from '../UsersRoutes';
import { Button } from '@app/Aplication/Components';
import { OutletSheet } from '@app/Aplication/Components/OutletSheet';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const isInDetail = useMatch(USERS_SEARCH_DETAIL_ROUTE);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(
    !!isInDetail || false,
  );

  const navigate = useNavigate();

  const handleSearch = () => {
    if (userId) {
      navigate(USERS_SEARCH_DETAIL_ROUTE.replace(':id', userId));
      setIsSheetOpen(true);
    }
  };

  return (
    <div className="flex gap-4 items-stretch">
      <Input
        type="text"
        name="search"
        id=""
        value={userId}
        onChange={({ target }) => setUserId(target.value)}
        className="max-w-[300px]"
      />

      <Button onClick={handleSearch}>Search</Button>

      <OutletSheet
        open={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        navigateToOnClose={USERS_ROUTE}
      ></OutletSheet>
    </div>
  );
};
