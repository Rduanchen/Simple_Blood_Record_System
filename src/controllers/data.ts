import { v4 as uuidv4 } from 'uuid';
import { BloodPressure, Op, UserNotificationService } from '../db/database';

interface RecordData {
  date: number;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export async function addRecord(datas: RecordData): Promise<{ status: string; message: string }> {
  const { date, systolic, diastolic, pulse } = datas;
  const id = uuidv4();
  try {
    await BloodPressure.create({ id, date: new Date(date), systolic, diastolic, pulse });
    console.log('Inserted record.');
    return { status: 'success', message: 'Record added' };
  } catch (err: any) {
    console.error('Error inserting record:', err.message);
    return { status: 'error', message: err.message };
  }
}

export async function findAllData(): Promise<RecordData[]> {
  try {
    const records = await BloodPressure.findAll();
    return records.map((record) => {
      const plainRecord = record.get({ plain: true });
      return {
        ...plainRecord,
        date: new Date(plainRecord.date).getTime(),
      };
    });
  } catch (err: any) {
    console.error('Error querying records:', err.message);
    throw err;
  }
}

export async function findRecentData(amount: number): Promise<RecordData[]> {
  try {
    const records = await BloodPressure.findAll({
      order: [['date', 'DESC']],
      limit: amount,
    });
    return records.map((record) => {
      const plainRecord = record.get({ plain: true });
      return {
        ...plainRecord,
        date: new Date(plainRecord.date).getTime(),
      };
    });
  } catch (err: any) {
    console.error('Error querying recent records:', err.message);
    throw err;
  }
}

export async function findDateAfter(date: string): Promise<RecordData[]> {
  try {
    const records = await BloodPressure.findAll({
      where: {
        date: {
          [Op.gte]: new Date(date),
        },
      },
    });
    return records.map((record) => {
      const plainRecord = record.get({ plain: true });
      return {
        ...plainRecord,
        date: new Date(plainRecord.date).getTime(),
      };
    });
  } catch (err: any) {
    console.error('Error querying date after records:', err.message);
    throw err;
  }
}

export async function updateData(id: string, datas: RecordData): Promise<void> {
  const { date, systolic, diastolic, pulse } = datas;
  try {
    await BloodPressure.update({ date: new Date(date), systolic, diastolic, pulse }, { where: { id } });
    console.log('Updated record.');
  } catch (err: any) {
    console.error('Error updating record:', err.message);
    throw err;
  }
}

export async function deleteData(id: string): Promise<void> {
  try {
    await BloodPressure.destroy({ where: { id } });
    console.log('Deleted record.');
  } catch (err: any) {
    console.error('Error deleting record:', err.message);
    throw err;
  }
}

export async function saveuserNotificationService(userId: string, token: string): Promise<{ status: string; message: string }> {
  try {
    await UserNotificationService.create({
      id: uuidv4(),
      userId,
      notificationId: token,
      createdAt: new Date(),
    });

    console.log('Inserted user notification service record.');
    return { status: 'success', message: 'Record added' };
  } catch (err: any) {
    console.error('Error inserting user notification service record:', err.message);
    return { status: 'error', message: err.message };
  }
}

interface UserNotificationToken {
  id: string;
  userId: string;
  notificationId: string;
  createdAt: number;
}

export async function findAllUserNotificationService(): Promise<UserNotificationToken[]> {
  try {
    const records = await UserNotificationService.findAll();
    const result: UserNotificationToken[] = [];
    records.forEach((record) => {
      const plainRecord = record.get({ plain: true });
      result.push({
        ...plainRecord,
        createdAt: new Date(plainRecord.createdAt).getTime(),
      });
    });
    return result;
  } catch (err: any) {
    console.error('Error querying user notification service records:', err.message);
    throw err;
  }
}
