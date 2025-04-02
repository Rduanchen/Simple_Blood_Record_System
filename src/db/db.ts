import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// 載入環境變數 (在本地開發時需要)
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not in env');
}

const sequelize: Sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
});

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

interface UserNotificationServiceAttributes {
  id: string;
  userId: string;
  notificationId: string;
  createdAt: Date;
}
class UserNotificationService extends Model<UserNotificationServiceAttributes> implements UserNotificationServiceAttributes {
  public id!: string;
  public userId!: string;
  public notificationId!: string;
  public createdAt!: Date;
}

UserNotificationService.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
    },
    notificationId: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'UserNotificationService',
    tableName: 'user_notification_service',
    timestamps: false,
  },
);

async function sync(): Promise<void> {
  await sequelize.sync();
}

export { sequelize, BloodPressure, sync, Op, UserNotificationService };
