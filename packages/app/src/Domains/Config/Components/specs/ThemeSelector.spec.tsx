import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSelector } from '../ThemeSelector';

vi.mock('@app/Application', () => ({
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock('@app/Application/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

const mockThemes = [
  {
    id: 1,
    nombre: 'Tema Azul',
    color_clase: 'bg-blue-500',
    texto_clase: 'text-white',
  },
  {
    id: 2,
    nombre: 'Tema Verde',
    color_clase: 'bg-green-500',
    texto_clase: 'text-white',
  },
] as never[];

describe('ThemeSelector', () => {
  it('renders the section title', () => {
    render(
      <ThemeSelector
        themes={mockThemes}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Elige un tema')).toBeInTheDocument();
  });

  it('renders a button for each theme', () => {
    render(
      <ThemeSelector
        themes={mockThemes}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Tema Azul')).toBeInTheDocument();
    expect(screen.getByText('Tema Verde')).toBeInTheDocument();
  });

  it('calls onChange with theme id when a theme button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <ThemeSelector
        themes={mockThemes}
        selectedId={null}
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByText('Tema Azul'));

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with the correct id for each theme', () => {
    const handleChange = vi.fn();
    render(
      <ThemeSelector
        themes={mockThemes}
        selectedId={1}
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByText('Tema Verde'));

    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('renders correctly with no themes', () => {
    render(<ThemeSelector themes={[]} selectedId={null} onChange={vi.fn()} />);
    expect(screen.getByText('Elige un tema')).toBeInTheDocument();
  });
});
