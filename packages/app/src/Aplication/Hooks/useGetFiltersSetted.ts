import { useURLParams } from '@app/Aplication';

/**
 * Hook para verificar si hay filtros configurados en la URL, excluyendo parámetros específicos
 * @param excludeParams Array de parámetros que se quieren excluir de la verificación
 * @returns Boolean que indica si hay filtros configurados
 */
export const useGetFiltersSetted = <T extends Record<string, string>>(
  excludeParams: string[] = [],
) => {
  const { searchParams } = useURLParams<T>();

  if (!searchParams) return false;

  // Filtrar los parámetros excluyendo los especificados
  const filteredParams = Object.keys(searchParams).filter(
    (key) => !excludeParams.includes(key),
  );

  // Verificar si hay algún parámetro después de filtrar
  return filteredParams.length > 0;
};
