/**
 * Helpers de empleados para la capa de Infrastructure.
 * No dependen de Sequelize ni de ningún modelo: son funciones puras.
 */

interface IEmployeeNameSource {
  nombre?: string | null;
  apellido?: string | null;
}

export const buildEmployeeName = (
  user: IEmployeeNameSource | undefined,
): string => {
  return `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim();
};

export const employeeSegmentName = (user: unknown): string | null => {
  const segmentUser = user as {
    UsuariosSegmentosModels?: Array<{
      TiposSegmentosModel?: { nombre?: string | null } | null;
    } | null>;
  };

  return (
    segmentUser?.UsuariosSegmentosModels?.[0]?.TiposSegmentosModel?.nombre ??
    null
  );
};
