export const Users = [
  {
    id: 1,
    name: 'admin',
    mail: 'admin@admin.com',
    password: '$2a$10$pxMW7.kXzU9YTOTVj4YSh.rN/ijGSOA8T6vbbSXR/Eu3wGa55aVUm',
    renewPassword: 1,
    userImage:
      'https://media.licdn.com/dms/image/v2/D4D03AQGnZHqP2ZrCpQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1707777018397?e=1733356800&v=beta&t=j1UYX7BCmIey_cdb86UTLNpXPbmMEcrlDeweWqDV_FY',
    ownerId: 1,
    companyLogo:
      'https://www.colorpluspinturerias.com/assets/images/color-plus-logo.png',
    companyName: 'Color Plus',
  },
  {
    id: 2,
    name: 'nico123',
    mail: 'prueba@gmail.com',
    password: '$2a$10$pxMW7.kXzU9YTOTVj4YSh.rN/ijGSOA8T6vbbSXR/Eu3wGa55aVUm',
    renewPassword: 1,
    userImage:
      'https://media.licdn.com/dms/image/v2/D4D03AQGnZHqP2ZrCpQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1707777018397?e=1733356800&v=beta&t=j1UYX7BCmIey_cdb86UTLNpXPbmMEcrlDeweWqDV_FY',
    ownerId: 1,
    companyLogo:
      'https://media.licdn.com/dms/image/v2/C560EAQFi2OGWfxI4qA/rightRail-logo-shrink_200_200/rightRail-logo-shrink_200_200/0/1630998002580?e=1728522000&v=beta&t=SlHmEK_Z3rKJWOcqgW_aH2BPuj_c33yarTSrjr6gu6s',
    companyName: 'LinkedIn',
  },
];

export const Products = [
  {
    id: '0',
    name: 'Remera',
    description: 'Remera de color negro',
    stock: 10,
    price: 100,
  },
  {
    id: '1',
    name: 'Remera 1',
    description: 'Remera de color negro',
    stock: 10,
    price: 1002,
  },
  {
    id: '2',
    name: 'Remera 2',
    description: 'Remera de color negro',
    stock: 10,
    price: 1003,
  },
  {
    id: '3',
    name: 'Remera 3',
    description: 'Remera de color negro',
    stock: 10,
    price: 103,
  },
  {
    id: '4',
    name: 'Remera 4',
    description: 'Remera de color negro',
    stock: 10,
    price: 104,
  },
];

export const Permissions = [
  {
    name: 'dasdboard-access',
    description: 'Lee el estado de todos los documentos',
  },
  {
    name: 'users-access',
    description:
      'Accede al listado de todos lo susuarios con la posibilidad de agregar, editar y eliminar',
  },
];

export const Roles = [
  {
    name: 'admin-access',
    description: 'Tienen acceso a toda la información de los empleados',
    permissions: ['dashboard-access', 'users-access'],
  },
  {
    name: 'recurso-humano',
    description: 'Tienen acceso a toda la información de los empleados',
    permissions: ['dashboard-access'],
  },
];

export const Roles_Users = [
  {
    userId: 1,
    roleName: 'admin-access',
  },
];

function shuffleString(str: string): string {
  if (str.length <= 2) return str;
  const firstTwo = str.slice(0, 2);
  const rest = str.slice(2).split('');
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return firstTwo + rest.join('');
}

export const Streets = [
  { id: 1, denominacion: 'Mitre' },
  { id: 2, denominacion: 'España' },
  { id: 3, denominacion: 'San Martín' },
  { id: 4, denominacion: 'Pellegrini' },
  // Generados automáticamente combinando las denominaciones existentes y mezclando letras
  ...Array.from({ length: 196 }, (_, i) => {
    const baseNames = ['Mitre', 'España', 'San Martín', 'Pellegrini'];
    const base = baseNames[i % baseNames.length];
    const shuffled = shuffleString(base);
    const suffix = Math.floor(i / baseNames.length) + 1;
    return {
      id: i + 5,
      denominacion: `${shuffled} ${suffix}`,
    };
  }),
];
