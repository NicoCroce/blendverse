import { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Hook para manejar parámetros de URL de forma reactiva
 * @template TParams - Tipo de los parámetros esperados
 * @param baseURL - URL base opcional para la navegación
 * @param debounceMs - Tiempo de debounce en milisegundos (opcional)
 */
export const useURLParams = <TParams extends Record<string, string | number>>(
  baseURL: string = '',
  debounceMs?: number,
) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Convertir searchParams a objeto tipado - se actualiza automáticamente
  const params = useMemo((): TParams | undefined => {
    if (searchParams.size === 0) return undefined;

    const entries = Array.from(searchParams.entries());
    return Object.fromEntries(entries) as TParams;
  }, [searchParams]);

  // Función para actualizar parámetros sin debounce
  const updateParams = useCallback(
    (
      newParams: Partial<
        Record<keyof TParams, string | number | null | undefined>
      >,
    ) => {
      const updatedParams = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          updatedParams.set(key, String(value));
        } else {
          updatedParams.delete(key);
        }
      });

      if (baseURL) {
        navigate(`${baseURL}?${updatedParams.toString()}`, { replace: true });
      } else {
        setSearchParams(updatedParams, { replace: true });
      }
    },
    [baseURL, navigate, searchParams, setSearchParams],
  );

  // Función para actualizar parámetros con debounce
  const updateDebouncedParams = useCallback(
    (
      newParams: Partial<
        Record<keyof TParams, string | number | null | undefined>
      >,
    ) => {
      if (!debounceMs) {
        updateParams(newParams);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateParams(newParams);
      }, debounceMs);
    },
    [updateParams, debounceMs],
  );

  // Función para limpiar todos los parámetros
  const clearParams = useCallback(() => {
    if (baseURL) {
      navigate(baseURL, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [baseURL, navigate, setSearchParams]);

  // Función para obtener un parámetro específico
  const getParam = useCallback(
    (key: keyof TParams): string | undefined => {
      return searchParams.get(key as string) || undefined;
    },
    [searchParams],
  );

  // Función para verificar si existe un parámetro
  const hasParam = useCallback(
    (key: keyof TParams): boolean => {
      return searchParams.has(key as string);
    },
    [searchParams],
  );

  return {
    params,
    updateParams,
    updateDebouncedParams,
    clearParams,
    getParam,
    hasParam,
    // Mantener compatibilidad con tu API actual
    searchParams: params,
  };
};
