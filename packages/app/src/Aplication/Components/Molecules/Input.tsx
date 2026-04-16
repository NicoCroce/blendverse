import { forwardRef, useState } from 'react';
import { Input as InputLib, InputProps as InputPropsLib } from '../ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from './Button';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useIsEditable } from '@app/Aplication/Hooks/useIsEditable';

interface InputProps extends InputPropsLib {
  forceEnabled?: boolean;
}

// Extiende el Input básico con forwardRef
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, forceEnabled = false, ...props }, ref) => {
    const isEditable = useIsEditable();
    return (
      <InputLib
        ref={ref}
        className={`h-8 bg-white ${className ?? ''}`}
        disabled={forceEnabled ? false : (disabled ?? !isEditable)}
        {...props}
      />
    );
  },
);

// Input de tipo contraseña con capacidad de mostrar/ocultar texto
const InputPassword = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        className="pr-14"
        type={show ? 'text' : 'password'}
        ref={ref}
        {...props}
      />
      <Button
        variant="outline"
        className="absolute right-0 top-[0.75px] p-[13px]"
        onClick={() => setShow((prev) => !prev)}
        type="button"
        forceEnabled
      >
        <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
      </Button>
    </div>
  );
});

// Crea un tipo que extiende el componente con una propiedad adicional
interface InputComponent
  extends React.ForwardRefExoticComponent<
    InputProps & React.RefAttributes<HTMLInputElement>
  > {
  Password: typeof InputPassword;
}

// Asocia InputPassword como una propiedad del Input
const InputWithPassword = Input as InputComponent;
InputWithPassword.Password = InputPassword;

Input.displayName = 'Input';
InputPassword.displayName = 'InputPassword';

export { InputWithPassword as Input };
