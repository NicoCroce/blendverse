import { useGlobalStore } from './useGlobalStore';

export const useDevice = () => {
  const { data } = useGlobalStore('isMobile');

  return {
    isMobile: data,
    isDesktop: !data,
  };
};
