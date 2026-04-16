interface IReciptItemEmail {
  denominacion: string;
  cantidad: number;
  precio: number;
  porc_desc: number;
  subtotal: number;
}

interface INewRecipt {
  reciptNumber: string;
  clientName: string;
  clientEmail: string;
  companyLogo?: string;
  companyName?: string;
  fecha: string;
  total: number;
  subtotalSinIva: number;
  iva: number;
  observaciones?: string;
  items?: IReciptItemEmail[];
}
const URL_ECOMMERCE =
  process.env.URL_ECOMMERCE || 'https://b2b.macrosistemas.ar';
const newRecipt = ({
  reciptNumber,
  clientName,
  clientEmail,
  companyLogo,
  companyName,
  fecha,
  total,
  subtotalSinIva,
  iva,
  observaciones,
  items,
}: INewRecipt) => ({
  subject: `🛒[Aviso] ${companyName || 'MacroGest'} - Nuevo pedido #${reciptNumber}`,
  body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 32px 24px;">
      <!-- Logo de la Empresa -->
      ${
        companyLogo
          ? `
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${companyLogo}" alt="${companyName || 'Logo'}" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
      </div>
      `
          : ''
      }
      
      <!-- Cabecera -->
      <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
        <h1 style="margin: 0 0 8px 0; font-size: 30px; font-weight: 700; color: #09090b; letter-spacing: -0.025em;">Nuevo Pedido #${reciptNumber}</h1>
        <p style="margin: 0; font-size: 14px; color: #71717a; font-weight: 400;">Pedido registrado el ${fecha}</p>
      </div>

      <!-- Mensaje de Agradecimiento -->
      <div style="margin-bottom: 32px; padding: 20px 24px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #86efac;">
        <div style="text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 24px;">🎉</p>
          <h2 style="margin: 0 0 8px 0; color: #166534; font-size: 18px; font-weight: 700; letter-spacing: -0.01em;">¡Gracias por tu pedido!</h2>
          <p style="margin: 0; color: #15803d; font-size: 15px; line-height: 1.6; font-weight: 500;">
            Estamos procesando tu solicitud con la mayor dedicación. Tu confianza es nuestro mayor compromiso.
          </p>
        </div>
      </div>

      <!-- Información del Cliente -->
      <div style="margin-bottom: 32px;">
        <h2 style="color: #09090b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Información del Cliente</h2>
        <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #52525b; font-size: 14px; line-height: 1.5;">
            <strong style="color: #18181b; font-weight: 500;">Cliente:</strong> ${clientName}
          </p>
          <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.5;">
            <strong style="color: #18181b; font-weight: 500;">Email:</strong> ${clientEmail}
          </p>
        </div>
      </div>

      <!-- Detalle de Items -->
      ${
        items && items.length > 0
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="color: #09090b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Detalle de Items</h2>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="background: #fafafa; color: #18181b; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px;">Producto</th>
                <th style="background: #fafafa; color: #18181b; padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px;">Cant.</th>
                <th style="background: #fafafa; color: #18181b; padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px;">Precio</th>
                <th style="background: #fafafa; color: #18181b; padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px;">Desc.</th>
                <th style="background: #fafafa; color: #18181b; padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #f4f4f5;">
                  <td style="padding: 14px 16px; color: #18181b; font-size: 14px; font-weight: 500;">${item.denominacion}</td>
                  <td style="padding: 14px 16px; text-align: right; color: #52525b; font-size: 14px;">${item.cantidad}</td>
                  <td style="padding: 14px 16px; text-align: right; color: #52525b; font-size: 14px; font-variant-numeric: tabular-nums;">$${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="padding: 14px 16px; text-align: right; color: #52525b; font-size: 14px;">${item.porc_desc}%</td>
                  <td style="padding: 14px 16px; text-align: right; font-weight: 600; color: #18181b; font-size: 14px; font-variant-numeric: tabular-nums;">$${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
      `
          : ''
      }

      <!-- Total -->
      <div style="margin-bottom: 32px;">
        <div style="background-color: #fafafa; padding: 20px 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: flex-end; align-items: center; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; gap: 24px;">
            <p style="margin: 0; font-size: 13px; font-weight: 500; color: #71717a;">Subtotal</p>
            <p style="margin: 0; font-size: 18px; font-weight: 500; color: #52525b; font-variant-numeric: tabular-nums; min-width: 140px; text-align: right;">$${subtotalSinIva.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; gap: 24px;">
            <p style="margin: 0; font-size: 13px; font-weight: 500; color: #71717a;">IVA (21%)</p>
            <p style="margin: 0; font-size: 18px; font-weight: 500; color: #52525b; font-variant-numeric: tabular-nums; min-width: 140px; text-align: right;">$${iva.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 24px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #52525b; text-transform: uppercase; letter-spacing: 0.05em;">Total del Pedido</p>
            <p style="margin: 0; font-size: 32px; font-weight: 700; color: #09090b; font-variant-numeric: tabular-nums; min-width: 140px; text-align: right;">$${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <!-- Observaciones -->
      ${
        observaciones
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="color: #09090b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Observaciones</h2>
        <div style="background-color: #fefce8; border-left: 3px solid #eab308; padding: 16px; border-radius: 8px; border: 1px solid #fef08a;">
          <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6;">${observaciones}</p>
        </div>
      </div>
      `
          : ''
      }

      <!-- Footer -->
      <div style="padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
          Este mail fue enviado de forma automática por 
          <strong><a href=${URL_ECOMMERCE} target="_blank" rel="nofollow" style="color: #18181b; text-decoration: underline; text-underline-offset: 2px;">${companyName || 'MacroGest'}</a></strong>
        </p>
      </div>
    </div>
  `,
});

interface INewUserRegistration {
  userName: string;
  userEmail: string;
  temporaryPassword?: string;
}

const newUserRegistration = ({
  userName,
  userEmail,
}: INewUserRegistration) => ({
  subject: `🔐 Bienvenido a MacroGest - Acceso Registrado`,
  body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px 24px;">
      <!-- Cabecera -->
      <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #09090b; letter-spacing: -0.025em;">¡Bienvenido a MacroGest!</h1>
        <p style="margin: 0; font-size: 14px; color: #71717a; font-weight: 400;">Tu cuenta ha sido creada exitosamente</p>
      </div>

      <!-- Saludo personalizado -->
      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0; color: #18181b; font-size: 15px; line-height: 1.6;">
          Hola <strong style="font-weight: 600;">${userName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
          Te damos la bienvenida a MacroGest. Tu cuenta ha sido registrada exitosamente en nuestro sistema.
        </p>
      </div>

      <!-- Información de acceso -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #09090b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Información de Acceso</h2>
        <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #52525b; font-size: 14px; line-height: 1.5;">
            <strong style="color: #18181b; font-weight: 500;">Usuario:</strong> ${userEmail}
          </p>
          <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.5;">
            <strong style="color: #18181b; font-weight: 500;">Contraseña:</strong> La que te proporcionó el administrador
          </p>
        </div>
      </div>

      <!-- Instrucciones importantes -->
      <div style="margin-bottom: 24px;">
        <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;">
          <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            ⚠️Importante - Acción Requerida
          </h3>
          <p style="margin: 0 0 8px 0; color: #78350f; font-size: 14px; line-height: 1.6;">
            Por seguridad, <strong>deberás cambiar tu contraseña</strong> en tu primer inicio de sesión.
          </p>
        </div>
      </div>

      <!-- Pasos a seguir -->
      <div style="margin-bottom: 32px;">
        <h2 style="color: #09090b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Próximos Pasos</h2>
        <ol style="margin: 0; padding-left: 20px; color: #52525b; font-size: 14px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Ingresa a la plataforma con tu usuario y contraseña</li>
          <li style="margin-bottom: 8px;">El sistema te solicitará cambiar tu contraseña</li>
          <li style="margin-bottom: 8px;">Elige una contraseña segura y fácil de recordar</li>
          <li>¡Comienza a utilizar MacroGest!</li>
        </ol>
      </div>

      <!-- Botón de acceso -->
      <div style="margin-bottom: 32px; text-align: center;">
        <a href=${URL_ECOMMERCE} target="_blank" rel="nofollow" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Acceder a MacroGest
        </a>
      </div>

      <!-- Ayuda -->
      <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; color: #18181b; font-size: 13px; font-weight: 600;">¿Necesitas ayuda?</p>
        <p style="margin: 0; color: #52525b; font-size: 13px; line-height: 1.5;">
          Si tienes alguna duda o problema para acceder, contacta con tu administrador del sistema.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
          Este mail fue enviado de forma automática por 
          <strong><a href=${URL_ECOMMERCE} target="_blank" rel="nofollow" style="color: #18181b; text-decoration: underline; text-underline-offset: 2px;">MacroGest</a></strong>
        </p>
        <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 12px;">
          Por favor, no respondas a este correo.
        </p>
      </div>
    </div>
  `,
});

export const emailTemplates = {
  newRecipt,
  newUserRegistration,
};
