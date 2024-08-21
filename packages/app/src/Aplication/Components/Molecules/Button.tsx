import { Button as LibButton, ButtonProps } from '../ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCircleCheck,
  faFloppyDisk,
  faTrashCan,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

type TClick = Pick<ButtonProps, 'onClick'>;

const CustomButtonOptions = {
  cancel: { icon: faXmark, variant: 'outline', text: 'Cancelar' },
  accept: { icon: faCircleCheck, variant: 'default', text: 'Aceptar' },
  save: { icon: faFloppyDisk, variant: 'default', text: 'Guardar' },
  delete: { icon: faTrashCan, variant: 'destructive', text: 'Eliminar' },
  default: { icon: undefined, variant: 'default', text: undefined },
} as const;

type TCustomButtonOptions = typeof CustomButtonOptions;
type TKeys = keyof TCustomButtonOptions;

interface CustomlButtonNewProps extends TClick {
  variant?: TKeys;
  showLabel?: boolean;
  showIcon?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  type?: 'submit' | 'reset' | 'button' | undefined;
}

export const Button = ({
  variant = 'default',
  onClick,
  showLabel = true,
  showIcon = false,
  isLoading = false,
  children,
  type = 'button',
}: CustomlButtonNewProps) => {
  const { variant: _variant, icon, text } = CustomButtonOptions[variant];
  return (
    <LibButton
      onClick={onClick}
      variant={_variant}
      className="flex gap-2"
      disabled={isLoading}
      type={type}
    >
      {showIcon && !isLoading && icon && <FontAwesomeIcon icon={icon} />}
      {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
      {variant === 'default' && children ? children : (showLabel && text) || ''}
    </LibButton>
  );
};
