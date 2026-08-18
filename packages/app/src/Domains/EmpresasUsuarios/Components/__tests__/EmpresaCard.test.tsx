import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@app/test/renderWithProviders';
import { EmpresaCard } from '../EmpresaCard';

const mockOnSelect = vi.fn();

const empresaWithLogo = {
  id: 123,
  denominacion: 'Empresa de Prueba S.A.',
  logo: 'https://example.com/logo.png',
};

const empresaWithoutLogo = {
  id: 456,
  denominacion: 'Empresa Sin Logo S.A.',
  logo: null as string | null,
};

const empresaWithLongName = {
  id: 789,
  denominacion:
    'Empresa con un nombre muy largo que debería ser truncado en la interfaz de usuario para evitar desbordamiento del contenedor',
  logo: 'https://example.com/logo.png',
};

const renderCard = (
  empresa: {
    id: number;
    denominacion: string;
    logo: string | null;
  } = empresaWithLogo,
  isLoading = false,
) =>
  renderWithProviders(
    <EmpresaCard
      empresa={empresa}
      onSelect={mockOnSelect}
      isLoading={isLoading}
    />,
  );

describe('EmpresaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderizado de imagen', () => {
    it('renderiza <img> con src={empresa.logo} cuando logo está presente y es URL válida', () => {
      renderCard(empresaWithLogo);

      const img = screen.getByRole('img', {
        name: empresaWithLogo.denominacion,
      });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', empresaWithLogo.logo);
    });

    it('renderiza inicial de denominacion en mayúsculas cuando logo === null', () => {
      renderCard(empresaWithoutLogo);

      const inicial = empresaWithoutLogo.denominacion.charAt(0).toUpperCase();
      expect(screen.getByText(inicial)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renderiza inicial cuando <img> dispara onError (mock de error de carga)', () => {
      renderCard(empresaWithLogo);

      const img = screen.getByRole('img', {
        name: empresaWithLogo.denominacion,
      });
      fireEvent.error(img);

      const inicial = empresaWithLogo.denominacion.charAt(0).toUpperCase();
      expect(screen.getByText(inicial)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('truncado de texto', () => {
    it('verifica que el <p> de denominación tiene clase truncate con denominación de 80 caracteres', () => {
      renderCard(empresaWithLongName);

      const denominacionElement = screen.getByText(
        empresaWithLongName.denominacion,
      );
      expect(denominacionElement).toHaveClass('truncate');
    });
  });

  describe('accesibilidad', () => {
    it('verifica que el <button> expone title y aria-label con denominación completa', () => {
      renderCard(empresaWithLongName);

      const button = screen.getByRole('button', {
        name: empresaWithLongName.denominacion,
      });
      expect(button).toHaveAttribute('title', empresaWithLongName.denominacion);
      expect(button).toHaveAttribute(
        'aria-label',
        empresaWithLongName.denominacion,
      );
    });
  });

  describe('selección de empresa', () => {
    it('fireEvent.click invoca onSelect exactamente una vez con empresa.id', () => {
      renderCard(empresaWithLogo);

      const button = screen.getByRole('button', {
        name: empresaWithLogo.denominacion,
      });
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledOnce();
      expect(mockOnSelect).toHaveBeenCalledWith(empresaWithLogo.id);
    });
  });
});
