import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyEmailDeliverySettingModel extends Model<
  InferAttributes<CompanyEmailDeliverySettingModel>,
  InferCreationAttributes<CompanyEmailDeliverySettingModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare code: string;
  declare audience: string;
  declare trigger: string;
  declare enabled: boolean;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

CompanyEmailDeliverySettingModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    code: { type: DataTypes.STRING(80), allowNull: false },
    audience: { type: DataTypes.STRING(20), allowNull: false },
    trigger: { type: DataTypes.STRING(80), allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
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
    modelName: 'CompanyEmailDeliverySetting',
    tableName: 'company_email_delivery_settings',
    timestamps: false,
  },
);
