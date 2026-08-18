import { emailFooter } from './shared';
import type { IAddLicense } from './types';

/** Template: aviso de nueva licencia a los admins. */
export const addLicense = ({ currentUser, reason }: IAddLicense) => ({
  subject: `[Aviso] Gestdoc - Nueva licencia de ${currentUser}`,
  body: `<h1> Nueva licencia</h1>
              <p>El empleado <strong> ${currentUser} </strong> agregó una licencia<p>
              <h2>Descripción de la licencia</h2>
              <p>${reason}</p>
              ${emailFooter}
              `,
});
