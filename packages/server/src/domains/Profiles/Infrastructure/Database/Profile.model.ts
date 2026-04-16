import { OwnersysModel } from '@server/domains/Ownersyss';
import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Model,
  CreationOptional,
} from 'sequelize';
export class ProfileModel extends Model<
  InferAttributes<ProfileModel>,
  InferCreationAttributes<ProfileModel>
> {
  declare id: CreationOptional<number>;
  declare id_propietario: number;
  declare denominacion: string;
  declare visualiza_stock: number;
  declare prioridad_precio: number;

  declare readonly OwnerSys: NonAttribute<InferAttributes<OwnersysModel>>;
}

ProfileModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_propietario: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    denominacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visualiza_stock: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    prioridad_precio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'Profile',
    timestamps: true,
    tableName: 'perfiles',
  },
);
