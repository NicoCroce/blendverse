import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';
import { ThemeModel } from '@server/domains/Themes/Infrastructure/Database/Theme.model';
export class OwnersysModel extends Model<
  InferAttributes<OwnersysModel>,
  InferCreationAttributes<OwnersysModel>
> {
  declare id: CreationOptional<number>;
  declare denominacion: string;
  declare logo: string;
  declare razon_social: string;
  declare cuit: number;
  declare domicilio_fiscal: string;
  declare telefonos_principales: string;
  declare email_corporativo: string;
  declare horarios_atencion: string;
  declare whatsapp: string;
  declare sucursal_pedido: number;
  declare sucursal_presupuestos: number;
  declare tema: CreationOptional<number>;
  declare Theme?: ThemeModel;
}

OwnersysModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    denominacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razon_social: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cuit: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    domicilio_fiscal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefonos_principales: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_corporativo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    horarios_atencion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sucursal_pedido: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    sucursal_presupuestos: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tema: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      references: {
        model: 'tema',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'Ownersys',
    timestamps: true,
    tableName: 'sis_propietarios',
  },
);

OwnersysModel.belongsTo(ThemeModel, { foreignKey: 'tema', as: 'Theme' });
ThemeModel.hasMany(OwnersysModel, { foreignKey: 'tema', as: 'Ownersyss' });
