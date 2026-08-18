export interface IOwnersys {
  denominacion: string;
  logo: string;
  razon_social: string;
  cuit: number;
  domicilio_fiscal: string;
  telefonos_principales: string;
  email_corporativo: string;
  horarios_atencion: string;
  whatsapp: string;
  sucursal_pedido: number;
  sucursal_presupuestos: number;
  id?: number;
  tema?: number;
  texto_disclaimer?: string;
}
