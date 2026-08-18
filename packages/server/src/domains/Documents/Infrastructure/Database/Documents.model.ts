import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infrastructure';
import { UserModel } from '@server/domains/Users';
import { sequelize } from '@server/Infrastructure';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';

export class Documentos extends Model<
  InferAttributes<Documentos>,
  InferCreationAttributes<Documentos>
> {
  declare id: CreationOptional<number>;
  declare tipo: number;
  declare Usuario_id: number;
  declare titulo: string;
  declare archivo: string;
  declare extension: CreationOptional<string | null>;
  declare fecha_de_subida: Date;
  declare firmado: CreationOptional<Date>;
  declare motivo_firma_sin_conformidad: string | null;
  declare visualizado: CreationOptional<Date>;
  declare validacion_de_firma: CreationOptional<string>;
  declare firma_bajo_acuerdo: CreationOptional<boolean>;
  declare User?: NonAttribute<InferAttributes<UserModel>>;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;

  // Relation
  declare readonly DocumentsTypesModel: NonAttribute<
    InferAttributes<DocumentsTypesModel>
  >;
}

Documentos.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    Usuario_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fecha_de_subida: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    extension: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    firmado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    motivo_firma_sin_conformidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visualizado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validacion_de_firma: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    firma_bajo_acuerdo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Documentos',
    paranoid: true,
    timestamps: true,
    tableName: 'documentos',
  },
);
