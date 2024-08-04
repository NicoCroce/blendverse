import { useState } from 'react';
import { Input } from '@app/Aplication/Components/ui/input';
import { useMatch } from 'react-router-dom';
import { USERS_ROUTE, USERS_SEARCH_DETAIL_ROUTE } from '../UsersRoutes';
import { Button } from '@app/Aplication/Components';
import { OutletSheet } from '@app/Aplication/Components/OutletSheet';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const isInDetail = useMatch(USERS_SEARCH_DETAIL_ROUTE);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(
    !!isInDetail || false,
  );

  const handleSearch = () => {
    if (userId) {
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
        setIsSheetOpen={setIsSheetOpen}
        open={isSheetOpen}
        navigateToOnClose={USERS_ROUTE}
      />
    </div>
  );
};
