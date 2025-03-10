/* eslint-disable @typescript-eslint/ban-types */
import dotenv from 'dotenv';
import pkg, { type QueryResult } from 'pg';
const { Client } = pkg;

// 載入環境變數 (在本地開發時需要)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// 創建資料庫連線
const pgDB = new Client({
  connectionString: process.env.DATABASE_URL,
  // Railway 內部連線不需要 SSL
  ssl:
    process.env.NODE_ENV === 'production'
      ? false
      : {
          rejectUnauthorized: false,
        },
});

interface sqliteDB {
  run: (sql: string, params?: any[], callback?: Function) => Promise<QueryResult>;
  all: (sql: string, params?: any[], callback?: Function) => Promise<any[]>;
  get: (sql: string, params?: any[], callback?: Function) => Promise<any>;
}

const db: sqliteDB = {
  run: async (sql: string, params: any[] = [], callback?: Function): Promise<QueryResult> => {
    throw new Error('Database not connected');
  },
  all: async (sql: string, params: any[] = [], callback?: Function): Promise<any[]> => {
    throw new Error('Database not connected');
  },
  get: async (sql: string, params: any[] = [], callback?: Function): Promise<any> => {
    throw new Error('Database not connected');
  },
};

// 立即連線到資料庫
pgDB
  .connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database.');

    // 確保 blood_pressure 表存在
    pgDB
      .query(
        `
      CREATE TABLE IF NOT EXISTS blood_pressure (
        id TEXT PRIMARY KEY,
        date BIGINT,
        systolic INTEGER,
        diastolic INTEGER,
        pulse INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
      )
      .then(() => {
        console.log('Table structure checked and created if needed');
      })
      .catch((err) => {
        console.error('Error creating table:', err);
      });
  })
  .catch((err: Error) => {
    console.error('Error opening database:', err.message);
  });

// 兼容舊有的回調風格接口
db.run = async (sql: string, params: any[] = [], callback?: Function): Promise<QueryResult> => {
  // 將 SQLite 參數格式 (?) 轉換為 PostgreSQL 格式 ($1, $2...)
  const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);

  try {
    const res = await pgDB.query(pgSql, params);
    if (callback !== null && callback !== undefined) callback(null);
    return res;
  } catch (err) {
    console.error('Query error:', err);
    if (callback !== null && callback !== undefined) callback(err);
    throw err;
  }
};

db.all = async (sql: string, params: any[] = [], callback?: Function): Promise<any[]> => {
  // 將 SQLite 參數格式 (?) 轉換為 PostgreSQL 格式 ($1, $2...)
  const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);

  try {
    const res = await pgDB.query(pgSql, params);
    if (callback !== null && callback !== undefined) callback(null, res.rows);
    return res.rows;
  } catch (err) {
    console.error('Query error:', err);
    if (callback !== null && callback !== undefined) callback(err, []);
    throw err;
  }
};

db.get = async (sql: string, params: any[] = [], callback?: Function): Promise<any> => {
  // 將 SQLite 參數格式 (?) 轉換為 PostgreSQL 格式 ($1, $2...)
  const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);

  try {
    const res = await pgDB.query(pgSql, params);
    if (callback !== null && callback !== undefined) callback(null, res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Query error:', err);
    if (callback !== null && callback !== undefined) callback(err, null);
    throw err;
  }
};

// 確保應用程式結束時關閉連線
process.on('SIGINT', () => {
  pgDB
    .end()
    .then(() => {
      console.log('Database connection closed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error closing database connection:', err);
      process.exit(1);
    });
});

export default db;
