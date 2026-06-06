import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCacheUsers } from '../useCacheUsers';

const {
  getQueryDataMock,
  invalidateQueriesMock,
  useQueryClientMock,
  getQueryKeyMock,
} = vi.hoisted(() => ({
  getQueryDataMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  getQueryKeyMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...(actual as object),
    useQueryClient: useQueryClientMock,
  };
});

vi.mock('@trpc/react-query', async () => {
  const actual = await vi.importActual('@trpc/react-query');
  return {
    ...(actual as object),
    getQueryKey: getQueryKeyMock,
  };
});

vi.mock('../../Users.service', () => ({
  UsersService: {
    getAll: {},
  },
}));

const mockQueryClient = {
  getQueryData: getQueryDataMock,
  invalidateQueries: invalidateQueriesMock,
};

const Harness = ({
  resultRef,
}: {
  resultRef: React.MutableRefObject<
    ReturnType<typeof useCacheUsers> | undefined
  >;
}) => {
  const result = useCacheUsers();
  useEffect(() => {
    resultRef.current = result;
  });
  return null;
};

describe('useCacheUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getQueryKeyMock.mockReturnValue(['users', 'getAll']);
    useQueryClientMock.mockReturnValue(mockQueryClient);
  });

  it('getData calls getQueryData with derived key', () => {
    const resultRef = { current: undefined } as React.MutableRefObject<
      ReturnType<typeof useCacheUsers> | undefined
    >;
    render(<Harness resultRef={resultRef} />);

    const params = { name: 'Alice', page: '1', limit: '10' };
    resultRef.current!.getData(params);

    expect(getQueryDataMock).toHaveBeenCalled();
    expect(getQueryKeyMock).toHaveBeenCalledWith(expect.anything(), params);
  });

  it('getData works without params', () => {
    const resultRef = { current: undefined } as React.MutableRefObject<
      ReturnType<typeof useCacheUsers> | undefined
    >;
    render(<Harness resultRef={resultRef} />);

    resultRef.current!.getData();

    expect(getQueryDataMock).toHaveBeenCalled();
  });

  it('invalidate calls invalidateQueries with the base key', () => {
    const resultRef = { current: undefined } as React.MutableRefObject<
      ReturnType<typeof useCacheUsers> | undefined
    >;
    render(<Harness resultRef={resultRef} />);

    if (resultRef.current) {
      resultRef.current.invalidate();
    }

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['users', 'getAll'],
    });
  });
});
