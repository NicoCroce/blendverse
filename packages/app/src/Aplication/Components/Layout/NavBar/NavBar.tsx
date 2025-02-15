import { MenuAccess } from '@app/Domains/MenuAccess';
import { NavBarHeader } from './NavBarHeader';

export const NavBar = ({ className = '' }: { className?: string }) => {
  return (
    <aside className={`navbar pt-6 md:pt-14 ${className}`}>
      <NavBarHeader />
      <nav className="flex flex-col h-full justify-between mt-4 md:py-4 md:px-2">
        <MenuAccess />
      </nav>
    </aside>
  );
};
