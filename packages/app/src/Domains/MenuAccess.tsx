import { Container } from '@app/Aplication';
import { MenuUsers } from './Users';
import { MenuMain } from './Main';
import { MenuAuth } from './Auth';

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const MenuAccess = () => (
  <>
    <Container id="sections" space="small">
      <MenuMain />
      <MenuUsers />
    </Container>
    <Container id="footer" space="small">
      <MenuAuth />
    </Container>
  </>
);
