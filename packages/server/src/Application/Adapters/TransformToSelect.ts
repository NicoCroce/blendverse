// Helper para obtener las claves de un objeto cuyas propiedades son de tipo string.
// Esto asegura que la propiedad que elijas para 'value' sea realmente un string.
/**
 * Transforma un array de objetos (donde los datos relevantes están en una subpropiedad 'values')
 * a un formato adecuado para un componente Select.
 * @param data Array de objetos, cada uno con una propiedad 'values' que contiene 'id' y la 'valueKey'.
 * @param valueKey La clave (nombre de la propiedad) dentro de 'item.values' que se usará para el campo 'value'.
 *                 Esta propiedad DEBE ser de tipo string.
 * @returns Un array de objetos con propiedades 'id' y 'value'.
 */
export const TransformToSelect = <
  TValues extends { id?: number } & {
    [key: string]: string | number | undefined;
  },
>(
  // data es un array de objetos, donde cada objeto tiene una propiedad 'values' de tipo TValues.
  data: Array<{ values: TValues }>,
  valueKey: Extract<keyof TValues, string>,
): Array<{ value: number; label: string }> => {
  if (!data) {
    return [];
  }
  return data.map((item) => ({
    // Accede a 'id' desde el objeto anidado 'item.values', asegurando que siempre sea un número
    value: item.values.id ?? 0,
    // Accede a la propiedad dinámica (cuyo nombre está en valueKey)
    // desde el objeto anidado 'item.values'.
    label: String(item.values[valueKey]),
  }));
};
