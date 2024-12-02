import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { RolesModel } from '@server/domains/Permissions';
import { sequelize } from '@server/Infrastructure';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare apellido: string;
  declare email: string;
  declare clave: string;
  declare renovar_clave: boolean;
  declare imagen?: CreationOptional<string>;
  declare telefono?: CreationOptional<string>;
  declare direccion?: CreationOptional<string>;
  declare localidad?: CreationOptional<string>;
  declare fecha_nac?: CreationOptional<string>;
  declare id_propietario?: CreationOptional<number>;

  declare readonly CompaniesModel: NonAttribute<
    InferAttributes<CompaniesModel>
  >;

  declare readonly RolesModels: NonAttribute<RolesModel[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING,
    clave: DataTypes.STRING,
    renovar_clave: DataTypes.BOOLEAN,
    imagen: DataTypes.STRING,

    telefono: DataTypes.STRING,
    direccion: DataTypes.STRING,
    localidad: DataTypes.STRING,
    fecha_nac: DataTypes.STRING,
    id_propietario: DataTypes.BIGINT,

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'User',
    timestamps: true,
    tableName: 'Usuarios',
  },
);
