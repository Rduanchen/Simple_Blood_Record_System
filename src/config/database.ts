import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// check environment variables
if (process.env.DATABASE_URL === undefined) {
  throw new Error('DATABASE_URL is not defined in .env file');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
