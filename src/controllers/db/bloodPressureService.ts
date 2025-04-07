import { BloodPressure } from '../../db/models';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface BloodPressureData {
  date: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
}

interface BloodPressureRecord extends BloodPressureData {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface BloodPressurePaginationResult {
  records: BloodPressureRecord[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * 根據使用者ID獲取所有血壓紀錄
 */
export async function getAllBloodPressuresByUserId(userId: string): Promise<BloodPressureRecord[]> {
  const records = await BloodPressure.findAll({
    where: { userId },
    order: [['date', 'DESC']],
  });

  return records as unknown as BloodPressureRecord[];
}

/**
 * 根據使用者ID獲取分頁的血壓紀錄（按日期排序）
 */
export async function getBloodPressuresByUserIdPaginated(
  userId: string,
  { limit = 10, offset = 0 }: PaginationParams,
): Promise<BloodPressurePaginationResult> {
  const { rows, count } = await BloodPressure.findAndCountAll({
    where: { userId },
    order: [['date', 'DESC']],
    limit,
    offset,
  });

  return {
    records: rows as unknown as BloodPressureRecord[],
    total: count,
    limit,
    offset,
  };
}

/**
 * 根據使用者ID和日期範圍獲取血壓紀錄
 */
export async function getBloodPressuresByDateRange(userId: string, startDate: Date, endDate: Date): Promise<BloodPressureRecord[]> {
  const records = await BloodPressure.findAll({
    where: {
      userId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['date', 'DESC']],
  });

  return records as unknown as BloodPressureRecord[];
}

/**
 * 新增血壓紀錄
 */
export async function createBloodPressure(userId: string, data: BloodPressureData): Promise<BloodPressureRecord> {
  const record = await BloodPressure.create({
    id: uuidv4(),
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return record as unknown as BloodPressureRecord;
}

/**
 * 更新血壓紀錄（檢查使用者ID是否匹配）
 */
export async function updateBloodPressure(
  userId: string,
  recordId: string,
  data: Partial<BloodPressureData>,
): Promise<BloodPressureRecord | null> {
  // 先找出記錄並檢查使用者ID
  const record = await BloodPressure.findOne({
    where: {
      id: recordId,
      userId,
    },
  });

  if (record === null || record === undefined) {
    return null; // 記錄不存在或不屬於此使用者
  }

  await record.update(data);
  return record as unknown as BloodPressureRecord;
}

/**
 * 刪除血壓紀錄（檢查使用者ID是否匹配）
 */
export async function deleteBloodPressure(userId: string, recordId: string): Promise<boolean> {
  // 先找出記錄並檢查使用者ID
  const record = await BloodPressure.findOne({
    where: {
      id: recordId,
      userId,
    },
  });

  if (record === null || record === undefined) {
    return false; // 記錄不存在或不屬於此使用者
  }

  await record.destroy();
  return true;
}

/**
 * 批次創建血壓紀錄
 */
export async function batchCreateBloodPressures(userId: string, records: BloodPressureData[]): Promise<BloodPressureRecord[]> {
  const recordsWithIds = records.map((record) => ({
    id: uuidv4(),
    userId,
    ...record,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const createdRecords = await BloodPressure.bulkCreate(recordsWithIds);
  return createdRecords as unknown as BloodPressureRecord[];
}

/**
 * 獲取單個血壓紀錄（檢查使用者ID是否匹配）
 */
export async function getBloodPressureById(userId: string, recordId: string): Promise<BloodPressureRecord | null> {
  const record = await BloodPressure.findOne({
    where: {
      id: recordId,
      userId,
    },
  });

  return record as unknown as BloodPressureRecord | null;
}
