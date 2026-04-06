import { useGetTheme } from './useGetTheme';
import { useGetOwnerTheme } from '@app/Domains/Config';

export const useChangeTheme = () => {
  const { dataOwnerTheme } = useGetOwnerTheme();
  const { data: theme } = useGetTheme(dataOwnerTheme || 1);

  if (theme) {
    document.documentElement.style.setProperty(
      '--primary',
      theme.color_primary_hsl,
    );
    document.documentElement.style.setProperty(
      '--ring',
      theme.color_primary_hsl,
    );
    document.documentElement.style.setProperty(
      '--accent',
      `${theme.color_primary_hsl} / 0.1`,
    );
    document.documentElement.style.setProperty(
      '--muted',
      `${theme.color_primary_hsl} / 0.1`,
    );
  }
};
