import React, { useEffect, useState } from 'react';
import { Input } from '@app/Aplication/Components/ui/input';
import { Link, useMatch } from 'react-router-dom';
import { OutletSheet } from '@app/Aplication/Components';
import { Button } from '@app/Aplication/Components';

import { USERS_ROUTE, USERS_SEARCH_DETAIL_ROUTE } from '../Users.routes';
import { useURLParams } from '@app/Aplication/Hooks/useURLParams';
import { TUserSearch } from '../User.entity';

export const SearchUser = () => {
  const [userId, setUserId] = useState<string>('');
  const isInDetail = useMatch(USERS_SEARCH_DETAIL_ROUTE);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(
    !!isInDetail || false,
  );
  // Initialize URL update params.
  const { searchParams, updateDebouncedParams } =
    useURLParams<TUserSearch>(USERS_ROUTE);
  const [filterSearch, setFilterSearch] = useState(searchParams?.name || '');

  useEffect(() => {
    if (isInDetail) setIsSheetOpen(true);
  }, [isInDetail]);

  const to = (userId && USERS_SEARCH_DETAIL_ROUTE.replace(':id', userId)) || '';

  const handleFilter = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFilterSearch(value);
    // Update URL params when change input.
    updateDebouncedParams({ name: value });
  };

  return (
    <div className="flex w-full gap-4 items-stretch bg-white">
      <Input
        type="text"
        name="search"
        id=""
        value={userId}
        onChange={({ target }) => setUserId(target.value)}
        className="max-w-[100px] "
        placeholder="ID a buscar"
      />
      <Link to={to}>
        <Button>Search</Button>
      </Link>
      <Input
        className="flex-auto w-full"
        type="text"
        name="filterName"
        onChange={handleFilter}
        value={filterSearch}
        placeholder="Escribe para filtrar por nombre"
      />

      <OutletSheet
        open={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        navigateToOnClose={USERS_ROUTE}
      />
    </div>
  );
};
