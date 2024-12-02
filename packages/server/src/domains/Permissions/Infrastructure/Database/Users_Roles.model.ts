import { sequelize } from '@server/Infrastructure';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { PermissionsModel } from './Permissions.model';

export class Users_RolesModel extends Model<
  InferAttributes<Users_RolesModel>,
  InferCreationAttributes<Users_RolesModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare id_rol: number;

  declare readonly PermissionsModels: NonAttribute<
    InferAttributes<PermissionsModel>
  >;
}

Users_RolesModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: DataTypes.NUMBER,
    id_rol: DataTypes.NUMBER,
  },
  {
    sequelize,
    paranoid: true,
    timestamps: true,
    tableName: 'Usuarios_roles',
  },
);
