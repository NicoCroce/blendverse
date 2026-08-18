import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class DisclaimerAcceptanceModel extends Model<
  InferAttributes<DisclaimerAcceptanceModel>,
  InferCreationAttributes<DisclaimerAcceptanceModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare id_empresa: number;
  declare hash_prueba: string;
  declare ip: string;
  declare user_agent: string | null;
  declare timestamp: Date;
  declare terms_version_id: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

DisclaimerAcceptanceModel.init(
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
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    hash_prueba: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    terms_version_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'DisclaimerAcceptance',
    timestamps: true,
    tableName: 'disclaimer_firmas',
  },
);
