import { sequelize } from '@server/Infrastructure';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { CertificatesTypesModel } from './CertificatesTypes.model';
import { UserModel } from '@server/domains/Users';

export class CertificateModel extends Model<
  InferAttributes<CertificateModel>,
  InferCreationAttributes<CertificateModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare fecha_inicio: Date;
  declare fecha_fin: Date;
  declare fecha_reintegro: Date;
  declare requiere_reposo: boolean;
  declare estado:
    | 'aprobado'
    | 'rechazado'
    | 'pendiente'
    | 'validando'
    | 'eliminado';

  declare motivo: string;
  declare id_tipo_certificado: number;
  declare archivos: CreationOptional<string[]>;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;

  // Relation
  declare readonly CertificatesTypesModel: NonAttribute<
    InferAttributes<CertificatesTypesModel>
  >;

  declare readonly User: NonAttribute<InferAttributes<UserModel>>;
}

CertificateModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_reintegro: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    requiere_reposo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    estado: {
      type: DataTypes.ENUM(
        'aprobado',
        'rechazado',
        'pendiente',
        'validando',
        'eliminado',
      ),
      defaultValue: 'pendiente',
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_tipo_certificado: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    archivos: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue('archivos');

        if (value == null) {
          return value;
        }

        if (Array.isArray(value)) {
          return value;
        }

        if (typeof value === 'string') {
          try {
            const parsed: unknown = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
          } catch {
            return [value];
          }
        }

        return value;
      },
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CertificateModel',
    paranoid: true,
    timestamps: true,
    tableName: 'certificados',
  },
);
