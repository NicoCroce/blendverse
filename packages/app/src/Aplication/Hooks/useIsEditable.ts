import { useGlobalStore } from './useGlobalStore';
import { useMemo } from 'react';
import { FULL_ADM_ACCESS } from '../Helpers/roles';

export function useIsEditable() {
  const { data } = useGlobalStore<{ rol?: string }>('dataUser');
  const rol = data?.rol;
  // Solo 'Full Admin' puede editar
  const isEditable = useMemo(() => {
    //return rol === ADM_ACCESS || rol === FULL_ADM_ACCESS;
    return rol === FULL_ADM_ACCESS;
  }, [rol]);
  return isEditable;
}
