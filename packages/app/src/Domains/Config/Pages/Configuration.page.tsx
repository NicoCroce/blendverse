import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Container,
  Input,
  Page,
  Text,
  Title,
  useGlobalStore,
} from '@app/Aplication';
import { useUpdateTheme } from '../Hooks/useUpdateTheme';
import { useGetThemes } from '../Hooks';
import { TUserLogged } from '@app/Domains/Users';
import { cn } from '@app/Aplication/lib/utils';

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
    navigate('/main');
  };

  const handleConfirmChange = () => {
    if (!selectedPrimary) return;
    setQueryData((prevData) => ({ ...prevData!, theme: selectedPrimary }));
    update(selectedPrimary);
  };

  return (
    <Page size="small" title="Configuración">
      {/* Selección de tema */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <Title variant="h2">Elige un tema</Title>
          <Text>
            Puedes cambiar el tema. Solo podrás cambiar el color principal.
          </Text>
        </div>
        {themes && (
          <div className="flex flex-wrap gap-3">
            {themes?.map(({ id, color_clase, nombre, texto_clase }) => (
              <button
                key={id}
                onClick={() => handleChange(id!)}
                className={cn(
                  color_clase,
                  texto_clase,
                  'py-2 px-5 rounded-lg text-xs font-medium transition-all ring-offset-2 ring-offset-background',
                  selectedPrimary === id
                    ? 'ring-2 ring-ring scale-105 shadow-md'
                    : 'hover:scale-105 hover:shadow-md',
                )}
              >
                {nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Previsualización */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <Title variant="h2">Previsualización</Title>
        <div className="space-y-4">
          <Container row className="flex-wrap">
            <Button variant="default">Aceptar</Button>
            <Button variant="destructive">Eliminar</Button>
            <Button variant="outline">Otro</Button>
            <Button variant="link">Link</Button>
            <Button variant="secondary">Acción</Button>
          </Container>
          <Checkbox label="Este es un dato" value="dato" />
          <Input placeholder="Prueba de input" />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2 mt-20">
        <Button
          onClick={handleConfirmChange}
          disabled={!selectedPrimary || isPending}
        >
          Guardar cambios
        </Button>
        <Button onClick={handleCancelChange} variant="destructive">
          Descartar
        </Button>
      </div>
    </Page>
  );
};
