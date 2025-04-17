import { v4 as uuidv4 } from 'uuid';
import { BloodPressure } from '../models';
import { BloodPressureAttributes } from '../models/BloodPressure';
import { Op } from 'sequelize';
import { createReadStream, createWriteStream } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { verifyAccess } from './accessService';

export const getAllBloodPressuresByUserId = async (userId: string, requesterId: string): Promise<BloodPressureAttributes[]> => {
  // Check if requester has access to the data
  if (userId !== requesterId) {
    const hasAccess = await verifyAccess(userId, requesterId);
    if (!hasAccess) {
      throw new Error('Unauthorized access');
    }
  }

  const records = await BloodPressure.findAll({
    where: {
      userId,
    },
    order: [['date', 'DESC']],
  });

  return records.map((record) => record.toJSON()) as BloodPressureAttributes[];
};

export const getBloodPressuresPaginated = async (
  userId: string,
  requesterId: string,
  offset: number = 0,
  limit: number = 10,
): Promise<BloodPressureAttributes[]> => {
  // Check if requester has access to the data
  if (userId !== requesterId) {
    const hasAccess = await verifyAccess(userId, requesterId);
    if (!hasAccess) {
      throw new Error('Unauthorized access');
    }
  }

  const records = await BloodPressure.findAll({
    where: {
      userId,
    },
    order: [['date', 'DESC']],
    offset,
    limit,
  });

  return records.map((record) => record.toJSON()) as BloodPressureAttributes[];
};

export const getBloodPressuresByDateRange = async (
  userId: string,
  requesterId: string,
  startDate: Date,
  endDate: Date,
): Promise<BloodPressureAttributes[]> => {
  // Check if requester has access to the data
  if (userId !== requesterId) {
    const hasAccess = await verifyAccess(userId, requesterId);
    if (!hasAccess) {
      throw new Error('Unauthorized access');
    }
  }

  const records = await BloodPressure.findAll({
    where: {
      userId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['date', 'DESC']],
  });

  return records.map((record) => record.toJSON()) as BloodPressureAttributes[];
};

export const createBloodPressure = async (
  userId: string,
  date: Date,
  systolic: number,
  diastolic: number,
  pulse: number,
): Promise<BloodPressureAttributes> => {
  const bloodPressure = await BloodPressure.create({
    id: uuidv4(),
    userId,
    date,
    systolic,
    diastolic,
    pulse,
  });

  return bloodPressure.toJSON() as BloodPressureAttributes;
};

export const updateBloodPressure = async (
  id: string,
  userId: string,
  updates: Partial<BloodPressureAttributes>,
): Promise<BloodPressureAttributes | null> => {
  const bloodPressure = await BloodPressure.findOne({
    where: {
      id,
      userId,
    },
  });

  if (bloodPressure === null) {
    return null;
  }

  // Remove id and userId from updates
  const { id: _, userId: __, ...safeUpdates } = updates;

  await bloodPressure.update(safeUpdates);

  return bloodPressure.toJSON() as BloodPressureAttributes;
};

export const deleteBloodPressure = async (id: string, userId: string): Promise<boolean> => {
  const deleted = await BloodPressure.destroy({
    where: {
      id,
      userId,
    },
  });

  return deleted > 0;
};

interface CsvBloodPressureRecord {
  date: string;
  systolic: string;
  diastolic: string;
  pulse: string;
}

export const importBloodPressuresFromCsv = async (
  userId: string,
  fileBuffer: Buffer,
): Promise<{ imported: number; skipped: number; errors: string[] }> => {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
    }) as CsvBloodPressureRecord[];

    for (const record of records) {
      try {
        const date = new Date(record.date);
        const systolic = parseInt(record.systolic, 10);
        const diastolic = parseInt(record.diastolic, 10);
        const pulse = parseInt(record.pulse, 10);

        // Validate data
        if (isNaN(date.getTime()) || isNaN(systolic) || isNaN(diastolic) || isNaN(pulse)) {
          results.errors.push(`Invalid data in record: ${JSON.stringify(record)}`);
          results.skipped++;
          continue;
        }

        // Check if record with same date exists
        const existingRecord = await BloodPressure.findOne({
          where: {
            userId,
            date,
          },
        });

        if (existingRecord !== null) {
          // Update existing record
          await existingRecord.update({
            systolic,
            diastolic,
            pulse,
          });
          results.imported++;
        } else {
          // Create new record
          await createBloodPressure(userId, date, systolic, diastolic, pulse);
          results.imported++;
        }
      } catch (error) {
        results.errors.push(`Error processing record: ${JSON.stringify(record)}`);
        results.skipped++;
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportBloodPressuresToCsv = async (userId: string, requesterId: string): Promise<string> => {
  // Check if requester has access to the data
  if (userId !== requesterId) {
    const hasAccess = await verifyAccess(userId, requesterId);
    if (!hasAccess) {
      throw new Error('Unauthorized access');
    }
  }

  const records = await BloodPressure.findAll({
    where: {
      userId,
    },
    order: [['date', 'ASC']],
  });

  const csvData = records.map((record) => ({
    id: record.id,
    date: record.date.toISOString(),
    systolic: record.systolic,
    diastolic: record.diastolic,
    pulse: record.pulse,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }));

  const csvString = stringify(csvData, {
    header: true,
    columns: ['id', 'date', 'systolic', 'diastolic', 'pulse', 'createdAt', 'updatedAt'],
  });

  // Create directory if it doesn't exist
  const dirPath = path.join(__dirname, '../../exports');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const fileName = `blood_pressure_export_${userId}_${Date.now()}.csv`;
  const filePath = path.join(dirPath, fileName);

  fs.writeFileSync(filePath, csvString);

  return filePath;
};
