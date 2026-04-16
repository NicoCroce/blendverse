import React, { useState } from 'react';
import { Input } from '@app/Aplication/Components';
import { Search } from 'lucide-react';
import { USERS_ROUTE } from '../Users.routes';
import { useURLParams } from '@app/Aplication/Hooks/useURLParams';
import { TUserSearch } from '../User.entity';
import { FilterResult } from './FilterResult';

export const SearchUser = () => {
  const { searchParams, updateDebouncedParams, updateParams } =
    useURLParams<TUserSearch>(USERS_ROUTE);
  const [filterSearch, setFilterSearch] = useState(searchParams?.name || '');

  const handleFilter = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFilterSearch(value);
    updateDebouncedParams({ name: value, page: 1 });
  };

  const clearInput = () => {
    setFilterSearch('');
    updateParams({ name: '', page: 1 });
  };

  return (
    <div className="flex w-full gap-4 items-stretch">
      <div className="relative flex-auto w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          className="pl-9 w-full"
          type="text"
          name="filterName"
          onChange={handleFilter}
          value={filterSearch}
          placeholder="Escribe para filtrar por nombre"
        />
        {filterSearch && <FilterResult onClick={clearInput} />}
      </div>
    </div>
  );
};
