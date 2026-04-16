import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

export class ThemeModel extends Model<
  InferAttributes<ThemeModel>,
  InferCreationAttributes<ThemeModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare color_clase: string;
  declare texto_clase: string;
  declare color_primary_hsl: string;
}

ThemeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color_clase: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    texto_clase: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color_primary_hsl: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: false,
    modelName: 'Theme',
    timestamps: false,
    tableName: 'tema',
  },
);
