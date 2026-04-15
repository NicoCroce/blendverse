import { Sequelize } from 'sequelize';

let sequelizeInstance: Sequelize | null = null;

export const initSequelize = () => {
  // Always create a new instance with current environment variables
  sequelizeInstance = new Sequelize({
    dialect: 'mysql',
    database: process.env.DB_DATABASE || '',
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    logging: false,
  });

  return sequelizeInstance;
};

export const getSequelize = () => {
  if (!sequelizeInstance) {
    // Auto-initialize if not done yet
    return initSequelize();
  }
  return sequelizeInstance;
};

// Create a lazy proxy that will initialize sequelize only when accessed
const handler: ProxyHandler<Sequelize> = {
  get(_target: unknown, prop: string): unknown {
    return Reflect.get(getSequelize(), prop);
  },
};

export const sequelize = new Proxy(getSequelize(), handler) as Sequelize;

export const connect = async () => {
  try {
    const sequelizeInstance = getSequelize();
    await sequelizeInstance.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
