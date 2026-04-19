import { Button, Checkbox, Container, Input, Title } from '@app/Aplication';

export const ThemePreview = () => {
  return (
    <Container
      space="large"
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <Title variant="h2">Previsualización</Title>
      <Container space="large">
        <Container row className="flex-wrap">
          <Button variant="default">Aceptar</Button>
          <Button variant="destructive">Eliminar</Button>
          <Button variant="outline">Otro</Button>
          <Button variant="link">Link</Button>
          <Button variant="secondary">Acción</Button>
        </Container>
        <Checkbox label="Este es un dato" value="dato" />
        <Input placeholder="Prueba de input" />
      </Container>
    </Container>
  );
};
