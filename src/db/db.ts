import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// 載入環境變數 (在本地開發時需要)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'production') {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null) {
    throw new Error('DATABASE_URL is not in env');
  }

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  const dbPath = path.resolve(__dirname, 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
  });
}

// 測試資料庫連線
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database:', err.message);
  });

interface BloodPressureAttributes {
  id: string;
  date: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
}

class BloodPressure extends Model<BloodPressureAttributes> implements BloodPressureAttributes {
  public id!: string;
  public date!: Date;
  public systolic!: number;
  public diastolic!: number;
  public pulse!: number;
}

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
    modelName: 'BloodPressure',
    tableName: 'blood_pressure',
    timestamps: false,
  },
);

async function sync(): Promise<void> {
  await sequelize.sync();
}

export { sequelize, BloodPressure, sync, Op };
