import db from '../db/db';
import { v4 as uuidv4 } from 'uuid';
export function addRecord(datas: any): any {
  const { date, systolic, diastolic, pulse } = datas;
  const id = uuidv4();
  const sql = `
    INSERT INTO blood_pressure (id, date, systolic, diastolic, pulse)
    VALUES (?, ?, ?, ?, ?)
    `;
  db.run(sql, [id, date, systolic, diastolic, pulse], (err) => {
    if (err !== null) {
      console.error('Error inserting record:', err.message);
      return { status: 'error', message: err.message };
    } else {
      console.log('Inserted record.');
      return { status: 'success', message: 'Record added' };
    }
  });
}

export async function findAllData(): Promise<any> {
  const sql = `SELECT * FROM blood_pressure`;
  return await new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err !== null) {
        console.error('Error querying records:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function findRecentData(amount: number): Promise<any> {
  const sql = `SELECT * FROM blood_pressure ORDER BY date DESC LIMIT ${amount}`;
  const rows = await new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err !== null) {
        console.error('Error querying records:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return rows;
}

export async function findDateAfter(date: string): Promise<any> {
  const sql = `SELECT * FROM blood_pressure WHERE date >= ?`;
  return await new Promise((resolve, reject) => {
    db.all(sql, [date], (err, rows) => {
      if (err !== null) {
        console.error('Error querying records:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function updateData(id: string, datas: any): Promise<void> {
  const { date, systolic, diastolic, pulse } = datas;
  const sql = `
    UPDATE blood_pressure
    SET date = ?, systolic = ?, diastolic = ?, pulse = ?
    WHERE id = ?
    `;
  console.log(id);
  db.run(sql, [date, systolic, diastolic, pulse, id], (err) => {
    if (err !== null) {
      console.error('Error updating record:', err.message);
    } else {
      console.log('Updated record.');
    }
  });
  console.log(await findAllData());
}

export function deleteData(id: string): void {
  const sql = `DELETE FROM blood_pressure WHERE id = ?`;
  db.run(sql, [id], (err) => {
    if (err !== null) {
      console.error('Error deleting record:', err.message);
    } else {
      console.log('Deleted record.');
    }
  });
}
