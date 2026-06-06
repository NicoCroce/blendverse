import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterResult } from '../FilterResult';

const { useGetUsersMock } = vi.hoisted(() => ({
  useGetUsersMock: vi.fn(),
}));

vi.mock('../../Hooks', () => ({
  useGetUsers: useGetUsersMock,
}));

vi.mock('@app/Application', () => ({
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock('@app/Application/Components/ui/badge', () => ({
  Badge: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <span data-testid="badge" onClick={onClick}>
      {children}
    </span>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faClose: {},
}));

describe('FilterResult', () => {
  it('returns null when totalItems is 0', () => {
    useGetUsersMock.mockReturnValue({
      data: { meta: { totalItems: 0 } },
      isFetching: false,
    });

    const { container } = render(<FilterResult onClick={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders total items count when data has results', () => {
    useGetUsersMock.mockReturnValue({
      data: { meta: { totalItems: 42 } },
      isFetching: false,
    });

    render(<FilterResult onClick={vi.fn()} />);

    expect(screen.getByTestId('badge')).toHaveTextContent('42');
  });

  it('renders "..." while fetching', () => {
    useGetUsersMock.mockReturnValue({
      data: { meta: { totalItems: 5 } },
      isFetching: true,
    });

    render(<FilterResult onClick={vi.fn()} />);

    expect(screen.getByTestId('badge')).toHaveTextContent('...');
  });

  it('calls onClick when badge is clicked', () => {
    const handleClick = vi.fn();
    useGetUsersMock.mockReturnValue({
      data: { meta: { totalItems: 5 } },
      isFetching: false,
    });

    render(<FilterResult onClick={handleClick} />);
    screen.getByTestId('badge').click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
