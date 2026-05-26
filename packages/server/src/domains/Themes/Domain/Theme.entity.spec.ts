import { describe, expect, it } from 'vitest';
import { Theme } from './Themes.entity';

describe('Theme entity', () => {
  const baseProps = {
    nombre: 'Dark',
    color_clase: 'dark',
    texto_clase: 'text-white',
    color_primary_hsl: '220 90% 50%',
  };

  it('creates a theme with all required fields', () => {
    const theme = Theme.create(baseProps);
    const { nombre, color_clase, texto_clase, color_primary_hsl } =
      theme.values;

    expect(nombre).toBe('Dark');
    expect(color_clase).toBe('dark');
    expect(texto_clase).toBe('text-white');
    expect(color_primary_hsl).toBe('220 90% 50%');
  });

  it('creates a theme with an optional id', () => {
    const theme = Theme.create({ ...baseProps, id: 5 });
    expect(theme.values.id).toBe(5);
  });

  it('id is undefined when not provided', () => {
    const theme = Theme.create(baseProps);
    expect(theme.values.id).toBeUndefined();
  });

  it('toJSON returns the same object as values', () => {
    const theme = Theme.create({ ...baseProps, id: 2 });
    expect(theme.toJSON()).toEqual(theme.values);
  });

  it('values returns all fields', () => {
    const theme = Theme.create({ ...baseProps, id: 3 });
    expect(theme.values).toEqual({
      id: 3,
      nombre: 'Dark',
      color_clase: 'dark',
      texto_clase: 'text-white',
      color_primary_hsl: '220 90% 50%',
    });
  });
});
