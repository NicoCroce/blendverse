import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyEmailReportSectionModel extends Model<
  InferAttributes<CompanyEmailReportSectionModel>,
  InferCreationAttributes<CompanyEmailReportSectionModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare code: string;
  declare enabled: boolean;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

CompanyEmailReportSectionModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    code: { type: DataTypes.STRING(80), allowNull: false },
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
    modelName: 'CompanyEmailReportSection',
    tableName: 'company_email_report_sections',
    timestamps: false,
  },
);
