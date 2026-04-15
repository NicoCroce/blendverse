import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Model,
  CreationOptional,
} from 'sequelize';
export class UserprofileModel extends Model<
  InferAttributes<UserprofileModel>,
  InferCreationAttributes<UserprofileModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare id_perfil: number;
  declare readonly User: NonAttribute<unknown>;
  declare readonly Profile: NonAttribute<unknown>;
}

UserprofileModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    id_perfil: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'Userprofile',
    timestamps: true,
    tableName: 'usuarios_perfiles',
  },
);
