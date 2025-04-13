import { forwardRef, useState } from 'react';
import { Input as InputLib, InputProps } from '../ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from './Button';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Extiende el Input básico con forwardRef
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <InputLib ref={ref} {...props} />;
});

// Input de tipo contraseña con capacidad de mostrar/ocultar texto
const InputPassword = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        className="pr-14"
        type={show ? 'text' : 'password'}
        ref={ref} // Pasa el ref al Input
        {...props}
      />
      <Button
        variant="outline"
        className="absolute right-0 top-[0.75px]"
        onClick={() => setShow((prev) => !prev)}
        type="button"
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
