import * as React from 'react';
import { Button as LibButton, ButtonProps } from '../ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCircleCheck,
  faFloppyDisk,
  faTrashCan,
  faSpinner,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useIsEditable } from '@/Aplication/Hooks/useIsEditable';

const CustomButtonOptions = {
  cancel: { icon: faXmark, variant: 'outline', text: 'Cancelar' },
  accept: { icon: faCircleCheck, variant: 'default', text: 'Aceptar' },
  save: { icon: faFloppyDisk, variant: 'default', text: 'Guardar' },
  delete: { icon: faTrashCan, variant: 'destructive', text: 'Eliminar' },
  default: { icon: undefined, variant: undefined, text: undefined },
} as const;

type TCustomButtonOptions = typeof CustomButtonOptions;
type TKeys = keyof TCustomButtonOptions;

// Permite forzar habilitado para casos como login
interface CustomlButtonNewProps extends ButtonProps {
  appearance?: TKeys;
  showLabel?: boolean;
  showIcon?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  type?: 'submit' | 'reset' | 'button' | undefined;
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  icon?: IconDefinition;
  forceEnabled?: boolean; // <--- NUEVO
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  CustomlButtonNewProps
>(
  (
    {
      appearance = 'default',
      onClick,
      showLabel = true,
      showIcon = false,
      isLoading = false,
      children,
      type = 'button',
      variant = 'default',
      disabled = false,
      className,
      icon,
      forceEnabled = false, // <--- NUEVO
      ...props
    },
    ref,
  ) => {
    const {
      variant: _variant,
      icon: iconPreset,
      text,
    } = CustomButtonOptions[appearance];
    const isEditable = useIsEditable();
    return (
      <LibButton
        {...props}
        ref={ref}
        onClick={onClick}
        variant={_variant ? _variant : variant}
        className={`flex gap-2 p-[14px] h-0 ${className}`}
        disabled={forceEnabled ? false : disabled || isLoading || !isEditable}
        type={type}
      >
        {showIcon && !isLoading && (icon || iconPreset) && (
          <FontAwesomeIcon icon={icon || iconPreset!} size="1x" />
        )}
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin size="1x" />}
        {appearance === 'default' && children
          ? children
          : (showLabel && text) || ''}
      </LibButton>
    );
  },
);

Button.displayName = 'Button';
