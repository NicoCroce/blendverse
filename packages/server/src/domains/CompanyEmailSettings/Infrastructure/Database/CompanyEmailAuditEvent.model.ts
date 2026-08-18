import { sequelize } from '@server/Infrastructure/Database';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class CompanyEmailAuditEventModel extends Model<
  InferAttributes<CompanyEmailAuditEventModel>,
  InferCreationAttributes<CompanyEmailAuditEventModel>
> {
  declare id: CreationOptional<number>;
  declare owner_id: number;
  declare actor_user_id: number | null;
  declare action: string;
  declare outcome: 'accepted' | 'rejected';
  declare reason_code: string | null;
  declare settings_version_before: number | null;
  declare settings_version_after: number | null;
  declare terms_version_before: number | null;
  declare terms_version_after: number | null;
  declare changed_codes: string[] | null;
  declare content_hash_before: string | null;
  declare content_hash_after: string | null;
  declare metadata: Record<string, unknown> | null;
  declare created_at: CreationOptional<Date>;
}

CompanyEmailAuditEventModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    actor_user_id: { type: DataTypes.BIGINT, allowNull: true },
    action: { type: DataTypes.STRING(80), allowNull: false },
    outcome: { type: DataTypes.STRING(20), allowNull: false },
    reason_code: { type: DataTypes.STRING(80), allowNull: true },
    settings_version_before: { type: DataTypes.BIGINT, allowNull: true },
    settings_version_after: { type: DataTypes.BIGINT, allowNull: true },
    terms_version_before: { type: DataTypes.BIGINT, allowNull: true },
    terms_version_after: { type: DataTypes.BIGINT, allowNull: true },
    changed_codes: { type: DataTypes.JSON, allowNull: true },
    content_hash_before: { type: DataTypes.CHAR(64), allowNull: true },
    content_hash_after: { type: DataTypes.CHAR(64), allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CompanyEmailAuditEvent',
    tableName: 'company_email_settings_audit_events',
    timestamps: false,
  },
);
