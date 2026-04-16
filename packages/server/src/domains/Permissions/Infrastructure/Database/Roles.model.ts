import { sequelize } from '@server/Infrastructure/Database';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { PermissionsModel } from './Permissions.model';

export class RolesModel extends Model<
  InferAttributes<RolesModel>,
  InferCreationAttributes<RolesModel>
> {
  declare id: CreationOptional<number>;
  declare denominacion: string;
  declare jerarquia: number;

  declare readonly PermissionsModels: NonAttribute<
    InferAttributes<PermissionsModel>
  >;
}

RolesModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    denominacion: DataTypes.STRING,
    jerarquia: DataTypes.INTEGER,
  },
  {
    sequelize,
    paranoid: true,
    timestamps: true,
    tableName: 'roles',
  },
);
