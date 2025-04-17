import { Request, Response } from 'express';
import * as bloodPressureService from '../services/bloodPressureService';
import * as safetyMonitorService from '../services/safetyMonitorService';
import { validationResult } from 'express-validator';
import * as fs from 'fs';

export const getAllBloodPressures = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const dataOwnerId = req.params.userId || userId;

    if (dataOwnerId === undefined) {
      res.status(400).json({ message: 'Data owner ID is required' });
      return;
    }

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    const bloodPressures = await bloodPressureService.getAllBloodPressuresByUserId(dataOwnerId, userId);

    res.json(bloodPressures);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access') {
      res.status(403).json({ message: 'You do not have permission to access this data' });
      return;
    }

    res.status(500).json({ message: 'Failed to fetch blood pressure records' });
  }
};

export const getBloodPressuresPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const dataOwnerId = req.params.userId || userId;
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit <= 0 || limit > 100) {
      res.status(400).json({ message: 'Invalid offset or limit parameters' });
      return;
    }

    if (dataOwnerId === undefined) {
      res.status(400).json({ message: 'Data owner ID is required' });
      return;
    }

    const bloodPressures = await bloodPressureService.getBloodPressuresPaginated(dataOwnerId, userId, offset, limit);

    res.json(bloodPressures);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access') {
      res.status(403).json({ message: 'You do not have permission to access this data' });
      return;
    }

    res.status(500).json({ message: 'Failed to fetch blood pressure records' });
  }
};

export const getBloodPressuresByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const dataOwnerId = req.params.userId || userId;
    const { startDate, endDate } = req.query;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    if (dataOwnerId === undefined) {
      res.status(400).json({ message: 'Data owner ID is required' });
      return;
    }

    const bloodPressures = await bloodPressureService.getBloodPressuresByDateRange(dataOwnerId, userId, startDateObj, endDateObj);

    res.json(bloodPressures);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access') {
      res.status(403).json({ message: 'You do not have permission to access this data' });
      return;
    }

    res.status(500).json({ message: 'Failed to fetch blood pressure records' });
  }
};

export const createBloodPressure = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { date, systolic, diastolic, pulse } = req.body;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const bloodPressure = await bloodPressureService.createBloodPressure(userId, dateObj, systolic, diastolic, pulse);

    // Check if the blood pressure needs to trigger alerts
    await safetyMonitorService.checkBloodPressureAlert(bloodPressure);

    res.status(201).json(bloodPressure);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create blood pressure record' });
  }
};

export const updateBloodPressure = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { id } = req.params;
    const { date, systolic, diastolic, pulse } = req.body;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    let dateObj: Date | undefined;

    if (date !== undefined) {
      dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
    }

    const updates: {
      date?: Date;
      systolic?: number;
      diastolic?: number;
      pulse?: number;
    } = {};

    if (dateObj !== undefined) {
      updates.date = dateObj;
    }

    if (systolic !== undefined) {
      updates.systolic = systolic;
    }

    if (diastolic !== undefined) {
      updates.diastolic = diastolic;
    }

    if (pulse !== undefined) {
      updates.pulse = pulse;
    }

    const updatedRecord = await bloodPressureService.updateBloodPressure(id, userId, updates);

    if (updatedRecord === null) {
      res.status(404).json({ message: 'Blood pressure record not found or you do not have permission to update it' });
      return;
    }

    // Check if the updated blood pressure needs to trigger alerts
    await safetyMonitorService.checkBloodPressureAlert(updatedRecord);

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blood pressure record' });
  }
};

export const deleteBloodPressure = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    const deleted = await bloodPressureService.deleteBloodPressure(id, userId);

    if (!deleted) {
      res.status(404).json({ message: 'Blood pressure record not found or you do not have permission to delete it' });
      return;
    }

    res.json({ message: 'Blood pressure record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blood pressure record' });
  }
};

export const importFromCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'CSV file is required' });
      return;
    }

    const fileBuffer = req.file.buffer;

    const result = await bloodPressureService.importBloodPressuresFromCsv(userId, fileBuffer);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to import blood pressure records',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const exportToCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const dataOwnerId = req.params.userId || userId;

    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    if (dataOwnerId === undefined) {
      res.status(400).json({ message: 'Data owner ID is required' });
      return;
    }

    const filePath = await bloodPressureService.exportBloodPressuresToCsv(dataOwnerId, userId);

    res.download(filePath, `blood_pressure_export_${Date.now()}.csv`, (err) => {
      if (err) {
        res.status(500).json({ message: 'Failed to download CSV file' });
      }

      // Clean up the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized access') {
      res.status(403).json({ message: 'You do not have permission to access this data' });
      return;
    }

    res.status(500).json({ message: 'Failed to export blood pressure records' });
  }
};
