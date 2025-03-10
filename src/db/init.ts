import db from './db';

// 創建血壓紀錄表的基本格式
export function createBloodPressureTable(): void {
  console.log('Creating blood_pressure table...');
  const table = `
CREATE TABLE IF NOT EXISTS blood_pressure (
  id TEXT PRIMARY KEY,
  date INTEGER,
  systolic INTEGER,
  diastolic INTEGER,
  pulse INTEGER
);
`;

  db.run(table, (err) => {
    if (err !== null) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Created blood_pressure table.');
    }
  });
}
