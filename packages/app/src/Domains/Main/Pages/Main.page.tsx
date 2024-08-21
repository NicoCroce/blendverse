import { Page, Title, Text, Link, Container, List } from '@app/Aplication';

export const MainPage = () => {
  return (
    <Page title="Blendverse" size="small">
      <Container row justify="center">
        <img
          src="https://github.com/user-attachments/assets/d6558622-7fa0-485e-9f75-2a0fe9c0aae8"
          width="512"
        />
      </Container>
      <Text>
        <Text.Code>Blendverse</Text.Code> captura la idea de un proyecto que
        integra diferentes tecnologías y frameworks de una manera armónica y
        fluida. El nombre es una combinación de <Text.Code>Blend,</Text.Code>
        que significa mezclar o fusionar, y <Text.Code>Verse,</Text.Code>
        derivado de <Text.Code>universe,</Text.Code> que hace referencia a un
        espacio o entorno cohesivo. En este caso,
        <Text.Code>Blendverse</Text.Code> sugiere un entorno en el que se unen
        tanto el backend (con tRPC, Node.js, Typescript, Express) como el
        frontend (con React, Typescript, React Router DOM, TanstackQuery y
        shadcn). Esta fusión de tecnologías crea un universo propio donde todo
        se conecta de manera eficiente, enfatizando la integración y la
        interoperabilidad entre todas las partes del proyecto.
      </Text>

      <Container>
        <Title variant="h2">Tabla de contenidos</Title>
        <List variant="ordered">
          <List.Li>
            <Link href="https://github.com/NicoCroce/blendverse?tab=readme-ov-file#contexto">
              Contexto
            </Link>
          </List.Li>
          <List.Li>
            <Link href="https://github.com/NicoCroce/blendverse?tab=readme-ov-file#tecnolog%C3%ADas-utilizadas">
              Tecnologías utilizadas
            </Link>
          </List.Li>
          <List.Li>
            <Link href="https://github.com/NicoCroce/blendverse?tab=readme-ov-file#primeros-pasos">
              Primeros pasos
            </Link>
          </List.Li>
          <List.Li>
            <Link href="https://github.com/NicoCroce/blendverse?tab=readme-ov-file#repositorios-de-blendverse">
              Repositorios de Blendverse
            </Link>
          </List.Li>
        </List>
      </Container>
      <Container>
        <Title variant="h2">Documentación de Server y App</Title>
        <Text.Small>
          Es necesario continuar leyendo estas documentaciones para entender la
          arquitectura de cada proyecto.
        </Text.Small>
        <List>
          <List.Li>
            Documentación de
            <Link href="https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md">
              Server
            </Link>
          </List.Li>
          <List.Li>
            Documentación de
            <Link href="https://github.com/NicoCroce/blendverse/blob/main/packages/app/README.md">
              Application
            </Link>
          </List.Li>
        </List>
      </Container>
    </Page>
  );
};
