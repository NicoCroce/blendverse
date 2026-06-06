import { describe, expect, it } from 'vitest';
import { Ownersys } from '../Ownersyss.entity';

const baseProps = {
  denominacion: 'Acme Corp',
  logo: 'logo.png',
  razon_social: 'Acme SRL',
  cuit: 20123456789,
  domicilio_fiscal: 'Av. Siempre Viva 742',
  telefonos_principales: '011-4444-5555',
  email_corporativo: 'info@acme.com',
  horarios_atencion: 'Lun-Vie 9-18',
  whatsapp: '1111111111',
  sucursal_pedido: 1,
  sucursal_presupuestos: 2,
};

describe('Ownersys entity', () => {
  it('creates an instance with all required fields', () => {
    const owner = Ownersys.create(baseProps);
    const v = owner.values;

    expect(v.denominacion).toBe('Acme Corp');
    expect(v.logo).toBe('logo.png');
    expect(v.razon_social).toBe('Acme SRL');
    expect(v.cuit).toBe(20123456789);
    expect(v.domicilio_fiscal).toBe('Av. Siempre Viva 742');
    expect(v.telefonos_principales).toBe('011-4444-5555');
    expect(v.email_corporativo).toBe('info@acme.com');
    expect(v.horarios_atencion).toBe('Lun-Vie 9-18');
    expect(v.whatsapp).toBe('1111111111');
    expect(v.sucursal_pedido).toBe(1);
    expect(v.sucursal_presupuestos).toBe(2);
  });

  it('optional id and tema are undefined when not provided', () => {
    const owner = Ownersys.create(baseProps);
    expect(owner.values.id).toBeUndefined();
    expect(owner.values.tema).toBeUndefined();
  });

  it('stores optional id and tema when provided', () => {
    const owner = Ownersys.create({ ...baseProps, id: 7, tema: 3 });
    expect(owner.values.id).toBe(7);
    expect(owner.values.tema).toBe(3);
  });

  it('toJSON returns the same object as values', () => {
    const owner = Ownersys.create({ ...baseProps, id: 1 });
    expect(owner.toJSON()).toEqual(owner.values);
  });
});
