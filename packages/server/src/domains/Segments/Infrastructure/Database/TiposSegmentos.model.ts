import { sequelize } from '@server/Infrastructure/Database';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';

export class TiposSegmentosModel extends Model<
  InferAttributes<TiposSegmentosModel>,
  InferCreationAttributes<TiposSegmentosModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare id_propietario: number;

  declare readonly UsuariosSegmentosModels: NonAttribute<unknown[]>;

  declare readonly UserModels: NonAttribute<unknown[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date>;
}

TiposSegmentosModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_propietario: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    paranoid: true,
    timestamps: true,
    tableName: 'tipos_segmentos',
  },
);
