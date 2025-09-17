import { useState, useEffect } from 'react';

interface UseAccumulatedDataProps<T> {
  data?: T[];
}

export const useAccumulatedData = <T>({ data }: UseAccumulatedDataProps<T>) => {
  const [accumulatedData, setAccumulatedData] = useState<T[]>([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAccumulatedData((prevData) => {
        const newData = data;

        // Si no hay datos previos, usar los nuevos datos
        if (prevData.length === 0) {
          return newData;
        }

        // Si hay más datos que antes, agregar solo los nuevos
        if (newData.length > prevData.length) {
          const newItems = newData.slice(prevData.length);
          return [...prevData, ...newItems];
        }

        // Si hay menos datos (por ejemplo, filtro aplicado), reemplazar
        if (newData.length < prevData.length) {
          return newData;
        }

        // Si es la misma cantidad, mantener los datos acumulados
        return prevData;
      });
    }
  }, [data]);

  // Función para resetear los datos acumulados (útil para filtros o recargas)
  const resetAccumulatedData = () => {
    setAccumulatedData([]);
  };

  // Función para agregar datos manualmente
  const addToAccumulatedData = (newItems: T[]) => {
    setAccumulatedData((prev) => [...prev, ...newItems]);
  };

  return {
    accumulatedData,
    resetAccumulatedData,
    addToAccumulatedData,
  };
};
