import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyEmailRecipientModel extends Model<
  InferAttributes<CompanyEmailRecipientModel>,
  InferCreationAttributes<CompanyEmailRecipientModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare email: string;
  declare normalized_email: string;
  declare source: 'backfill' | 'lazy_provision' | 'manual';
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

CompanyEmailRecipientModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    email: { type: DataTypes.STRING(320), allowNull: false },
    normalized_email: { type: DataTypes.STRING(320), allowNull: false },
    source: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'manual',
    },
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
    modelName: 'CompanyEmailRecipient',
    tableName: 'company_email_recipients',
    timestamps: false,
  },
);
