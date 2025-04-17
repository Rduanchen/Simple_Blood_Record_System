import { Request, Response } from 'express';
import * as safetyMonitorService from '../services/safetyMonitorService';
import { validationResult } from 'express-validator';

export const getSafetyMonitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const safetyMonitor = await safetyMonitorService.getSafetyMonitorByUserId(userId);
    
    if (safetyMonitor === null) {
      // If not found, create a default one
      const newSafetyMonitor = await safetyMonitorService.createSafetyMonitor(userId);
      res.json(newSafetyMonitor);
      return;
    }
    
    res.json(safetyMonitor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch safety monitor settings' });
  }
};

export const updateSafetyMonitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const userId = req.userId;
    const { notificationSwitch, warningBasis, dangerBasis } = req.body;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const updates: {
      notificationSwitch?: boolean;
      warningBasis?: { systolic: number; diastolic: number; pulse: number };
      dangerBasis?: { systolic: number; diastolic: number; pulse: number };
    } = {};
    
    if (notificationSwitch !== undefined) {
      updates.notificationSwitch = notificationSwitch;
    }
    
    if (warningBasis !== undefined) {
      updates.warningBasis = warningBasis;
    }
    
    if (dangerBasis !== undefined) {
      updates.dangerBasis = dangerBasis;
    }
    
    const updatedSafetyMonitor = await safetyMonitorService.updateSafetyMonitor(userId, updates);
    
    if (updatedSafetyMonitor === null) {
      // If not found, create a new one with the provided updates
      const newSafetyMonitor = await safetyMonitorService.createSafetyMonitor(
        userId,
        updates.notificationSwitch,
        updates.warningBasis,
        updates.dangerBasis
      );
      
      res.json(newSafetyMonitor);
      return;
    }
    
    res.json(updatedSafetyMonitor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update safety monitor settings' });
  }
};