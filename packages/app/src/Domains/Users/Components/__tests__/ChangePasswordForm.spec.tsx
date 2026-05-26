import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePasswordForm } from '../ChangePassword/ChangePasswordForm';
import { renderWithProviders } from '@app/test/renderWithProviders';

const { mutateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
}));

vi.mock('../../Hooks', () => ({
  useChangePassword: () => ({
    mutate: mutateMock,
    isSuccess: false,
    isPending: false,
  }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faEye: {},
  faEyeSlash: {},
  faSpinner: {},
  faXmark: {},
  faCircleCheck: {},
  faFloppyDisk: {},
  faTrashCan: {},
  faEdit: {},
  faTrash: {},
}));

vi.mock('@app/Aplication/Hooks/useIsEditable', () => ({
  useIsEditable: () => true,
}));

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los tres campos de contraseña', () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña nueva')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Ingrese nuevamente la contraseña nueva'),
    ).toBeInTheDocument();
  });

  it('renderiza el botón Aceptar', () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(
      screen.getByRole('button', { name: /aceptar/i }),
    ).toBeInTheDocument();
  });

  it('no renderiza el botón Cancelar si no se pasa onClose', () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(
      screen.queryByRole('button', { name: /cancelar/i }),
    ).not.toBeInTheDocument();
  });

  it('renderiza el botón Cancelar cuando se pasa onClose', () => {
    renderWithProviders(<ChangePasswordForm onClose={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it('llama a mutate con los valores correctos al enviar el formulario', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText('Contraseña actual'), 'Password123');
    await user.type(screen.getByLabelText('Contraseña nueva'), 'NuevaPass1');
    await user.type(
      screen.getByLabelText('Ingrese nuevamente la contraseña nueva'),
      'NuevaPass1',
    );
    await user.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(mutateMock).toHaveBeenCalledWith({
      password: 'Password123',
      newPassword: 'NuevaPass1',
      rePassword: 'NuevaPass1',
    });
  });

  it('muestra error si la contraseña actual tiene menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText('Contraseña actual'), 'short');
    await user.click(screen.getByRole('button', { name: /aceptar/i }));

    const errors = await screen.findAllByText(
      'La contraseña debe ser mayor a 8 caracteres',
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('muestra error si las contraseñas nuevas no coinciden', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText('Contraseña actual'), 'Password123');
    await user.type(screen.getByLabelText('Contraseña nueva'), 'NuevaPass1');
    await user.type(
      screen.getByLabelText('Ingrese nuevamente la contraseña nueva'),
      'OtraPass2',
    );
    await user.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(
      await screen.findByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('llama a onClose al hacer click en Cancelar', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    renderWithProviders(<ChangePasswordForm onClose={onCloseMock} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCloseMock).toHaveBeenCalled();
  });
});
