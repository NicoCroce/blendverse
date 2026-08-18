import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyEmailSettingsModel extends Model<
  InferAttributes<CompanyEmailSettingsModel>,
  InferCreationAttributes<CompanyEmailSettingsModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare version: number;
  declare welcome_message: string | null;
  declare current_terms_version_id: number | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

CompanyEmailSettingsModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    version: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
    welcome_message: { type: DataTypes.TEXT, allowNull: true },
    current_terms_version_id: { type: DataTypes.BIGINT, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CompanyEmailSettings',
    tableName: 'company_email_settings',
    timestamps: false,
  },
);
