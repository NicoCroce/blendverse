import { useMemo } from 'react';

export function useIsEditable() {
  //const { data } = useGlobalStore<{ rol?: string }>('dataUser');
  //const rol = data?.rol;
  // Solo 'Full Admin' puede editar
  const isEditable = useMemo(() => {
    return true;
    //return rol === FULL_ADM_ACCESS;
  }, []);
  return isEditable;
}
