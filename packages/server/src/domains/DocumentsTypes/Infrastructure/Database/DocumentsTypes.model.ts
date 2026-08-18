import { sequelize } from '@server/Infrastructure';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export type DocumentsTypesModelAttributes = Array<
  keyof InferAttributes<DocumentsTypesModel>
>;

export class DocumentsTypesModel extends Model<
  InferAttributes<DocumentsTypesModel>,
  InferCreationAttributes<DocumentsTypesModel>
> {
  declare id: CreationOptional<number>;
  declare denominacion: string;
  declare requiere_firma: boolean;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date>;
}

DocumentsTypesModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    denominacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requiere_firma: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'DocumentsTypesModel',
    tableName: 'sis_tipo_documentos',
  },
);
