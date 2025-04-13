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

const CustomButtonOptions = {
  cancel: { icon: faXmark, variant: 'outline', text: 'Cancelar' },
  accept: { icon: faCircleCheck, variant: 'default', text: 'Aceptar' },
  save: { icon: faFloppyDisk, variant: 'default', text: 'Guardar' },
  delete: { icon: faTrashCan, variant: 'destructive', text: 'Eliminar' },
  default: { icon: undefined, variant: undefined, text: undefined },
} as const;

type TCustomButtonOptions = typeof CustomButtonOptions;
type TKeys = keyof TCustomButtonOptions;

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
}

export const Button = ({
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
  ...props
}: CustomlButtonNewProps) => {
  const {
    variant: _variant,
    icon: iconPreset,
    text,
  } = CustomButtonOptions[appearance];
  return (
    <LibButton
      {...props}
      onClick={onClick}
      variant={_variant ? _variant : variant}
      className={`flex gap-2 p-4 h-0 ${className}`}
      disabled={disabled || isLoading}
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
};
