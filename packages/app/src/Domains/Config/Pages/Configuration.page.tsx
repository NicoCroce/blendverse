import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, useGlobalStore } from '@app/Aplication';
import { useUpdateTheme } from '../Hooks/useUpdateTheme';
import { useGetThemes } from '../Hooks';
import { TUserLogged } from '@app/Domains/Users';
import { ConfigActions, ThemePreview, ThemeSelector } from '../Components';
import { MAIN_ROUTE } from '@app/Domains/Main';

export const ConfigurationPage = () => {
  const navigate = useNavigate();
  const { update, isPending } = useUpdateTheme();
  const { data: themes } = useGetThemes();
  const [selectedPrimary, setSelectedPrimary] = useState<number | null>(null);
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');
  const [originalPrimary] = useState(() =>
    document.documentElement.style.getPropertyValue('--primary'),
  );

  const handleChange = (themeId: number) => {
    setSelectedPrimary(themeId);
    if (!themes) return;

    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    document.documentElement.style.setProperty(
      '--primary',
      theme.color_primary_hsl,
    );
    document.documentElement.style.setProperty(
      '--ring',
      theme.color_primary_hsl,
    );
  };

  const handleCancelChange = () => {
    document.documentElement.style.setProperty('--primary', originalPrimary);
    document.documentElement.style.setProperty('--ring', originalPrimary);
    navigate(MAIN_ROUTE);
  };

  const handleConfirmChange = () => {
    if (!selectedPrimary) return;
    setQueryData((prevData) => ({ ...prevData!, theme: selectedPrimary }));
    update(selectedPrimary);
  };

  return (
    <Page size="small" title="Configuración">
      {themes && (
        <ThemeSelector
          themes={themes}
          selectedId={selectedPrimary}
          onChange={handleChange}
        />
      )}
      <ThemePreview />
      <ConfigActions
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        disabled={!selectedPrimary}
        isPending={isPending}
      />
    </Page>
  );
};
