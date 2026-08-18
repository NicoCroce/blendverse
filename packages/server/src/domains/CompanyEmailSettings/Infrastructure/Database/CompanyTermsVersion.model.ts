import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyTermsVersionModel extends Model<
  InferAttributes<CompanyTermsVersionModel>,
  InferCreationAttributes<CompanyTermsVersionModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare version_number: number;
  declare content_html: string;
  declare content_hash: string;
  declare published_at: Date;
  declare published_by: number | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

CompanyTermsVersionModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    version_number: { type: DataTypes.BIGINT, allowNull: false },
    content_html: { type: DataTypes.TEXT('long'), allowNull: false },
    content_hash: { type: DataTypes.CHAR(64), allowNull: false },
    published_at: { type: DataTypes.DATE, allowNull: false },
    published_by: { type: DataTypes.BIGINT, allowNull: true },
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
    modelName: 'CompanyTermsVersion',
    tableName: 'company_terms_versions',
    timestamps: false,
  },
);
