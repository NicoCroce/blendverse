import { Button as LibButton, ButtonProps } from '../ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCircleCheck,
  faFloppyDisk,
  faTrashCan,
  faSpinner,
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
  ...props
}: CustomlButtonNewProps) => {
  const { variant: _variant, icon, text } = CustomButtonOptions[appearance];
  return (
    <LibButton
      {...props}
      onClick={onClick}
      variant={_variant ? _variant : variant}
      className="flex gap-2"
      disabled={isLoading}
      type={type}
    >
      {showIcon && !isLoading && icon && <FontAwesomeIcon icon={icon} />}
      {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
      {appearance === 'default' && children
        ? children
        : (showLabel && text) || ''}
    </LibButton>
  );
};
