import { Container, Text, Title } from '@app/Aplication';
import { cn } from '@app/Aplication/lib/utils';
import { ITheme } from '@server/domains/Themes';

interface ThemeSelectorProps {
  themes: ITheme[];
  selectedId: number | null;
  onChange: (id: number) => void;
}

export const ThemeSelector = ({
  themes,
  selectedId,
  onChange,
}: ThemeSelectorProps) => {
  return (
    <Container
      space="large"
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <Container space="large">
        <Title variant="h2">Elige un tema</Title>
        <Text>
          Puedes cambiar el tema. Solo podrás cambiar el color principal.
        </Text>
      </Container>
      <Container row className="flex-wrap gap-3">
        {themes.map(({ id, color_clase, nombre, texto_clase }) => (
          <button
            key={id}
            onClick={() => onChange(id!)}
            className={cn(
              color_clase,
              texto_clase,
              'py-2 px-5 rounded-lg text-xs font-medium transition-all ring-offset-2 ring-offset-background',
              selectedId === id
                ? 'ring-2 ring-ring scale-105 shadow-md'
                : 'hover:scale-105 hover:shadow-md',
            )}
          >
            {nombre}
          </button>
        ))}
      </Container>
    </Container>
  );
};
