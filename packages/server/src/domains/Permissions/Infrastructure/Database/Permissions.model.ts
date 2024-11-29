import { sequelize } from '@server/Infrastructure';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export class PermissionsModel extends Model<
  InferAttributes<PermissionsModel>,
  InferCreationAttributes<PermissionsModel>
> {
  declare id: CreationOptional<number>;
  declare codigo: string;
  declare denominacion: string;
}

PermissionsModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    codigo: DataTypes.STRING,
    denominacion: DataTypes.STRING,
  },
  {
    sequelize,
    paranoid: true,
    timestamps: true,
    tableName: 'Permisos',
  },
);
