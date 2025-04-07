import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import setupModels from './models';

// 載入環境變數 (在本地開發時需要)
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (dbUrl == null) {
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

// 初始化資料庫模型和關聯
const db = setupModels(sequelize);

// 同步所有模型到資料庫的函數
const syncDatabase: (force?: boolean) => Promise<void> = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('資料庫同步成功');
  } catch (error) {
    console.error('資料庫同步失敗:', error);
    throw error;
  }
};

export { db, sequelize, syncDatabase };
