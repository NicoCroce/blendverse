import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';
import { OwnersysModel } from '@server/domains/Ownersyss/Infrastructure/Database/Ownersys.model';

export class EmpresasUsuariosModel extends Model<
  InferAttributes<EmpresasUsuariosModel>,
  InferCreationAttributes<EmpresasUsuariosModel>
> {
  declare id: CreationOptional<number>;
  declare id_empresa: number;
  declare id_usuario: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
  declare Empresa?: OwnersysModel;
}

EmpresasUsuariosModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'EmpresasUsuarios',
    timestamps: true,
    tableName: 'empresas_usuarios',
  },
);

EmpresasUsuariosModel.belongsTo(OwnersysModel, {
  foreignKey: 'id_empresa',
  as: 'Empresa',
});
