import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';

// connect to postgres database

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

let dbUrl: string;
if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === '') {
  throw new Error('DATABASE_URL is not in env');
} else {
  console.log('DATABASE_URL is set');
  dbUrl = process.env.DATABASE_URL;
}

const sequelize = new Sequelize(dbUrl);

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

class BloodPressure extends Model {}
BloodPressure.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
    },
    systolic: {
      type: DataTypes.INTEGER,
    },
    diastolic: {
      type: DataTypes.INTEGER,
    },
    pulse: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'blood_pressure',
  },
);

async function sync(): Promise<void> {
  await sequelize.sync();
}

export { sequelize, init };
