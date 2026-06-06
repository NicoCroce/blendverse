import { useGlobalStore } from './useGlobalStore';

export const useDevice = () => {
  let { data } = useGlobalStore('isMobile');

  if (data === undefined) data = true;

  return {
    isMobile: data,
    isDesktop: !data,
  };
};
