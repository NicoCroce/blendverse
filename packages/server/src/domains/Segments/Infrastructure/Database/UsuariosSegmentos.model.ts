import { sequelize } from '@server/Infrastructure/Database';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { UserModel } from '@server/domains/Users/Infrastructure/Database/Users.model';
import { TiposSegmentosModel } from './TiposSegmentos.model';

export class UsuariosSegmentosModel extends Model<
  InferAttributes<UsuariosSegmentosModel>,
  InferCreationAttributes<UsuariosSegmentosModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare id_segmento: number;

  declare readonly UserModel: NonAttribute<InferAttributes<UserModel>>;
  declare readonly TiposSegmentosModel: NonAttribute<
    InferAttributes<TiposSegmentosModel>
  >;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date>;
}

UsuariosSegmentosModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_segmento: {
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
    tableName: 'usuarios_segmentos',
  },
);
