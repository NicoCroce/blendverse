import { sequelize } from '@server/Infrastructure';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class CertificatesTypesModel extends Model<
  InferAttributes<CertificatesTypesModel>,
  InferCreationAttributes<CertificatesTypesModel>
> {
  declare id: CreationOptional<number>;

  declare denominacion: string;
  declare descripcion: string;
  declare reposo: boolean;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;
}

CertificatesTypesModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    denominacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reposo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CertificatesTypesModel',
    paranoid: true,
    timestamps: true,
    tableName: 'tipo_certificados',
  },
);
