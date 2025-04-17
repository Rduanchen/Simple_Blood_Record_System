import { Request, Response } from 'express';
import * as shareCodeService from '../services/shareCodeService';
import { validationResult } from 'express-validator';

export const generateShareCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const userId = req.userId;
    const { expiryDays } = req.body;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    let expiryDaysNum = 7; // Default to 7 days
    
    if (expiryDays !== undefined) {
      expiryDaysNum = parseInt(expiryDays, 10);
      
      if (isNaN(expiryDaysNum) || expiryDaysNum <= 0 || expiryDaysNum > 30) {
        res.status(400).json({ message: 'Expiry days must be between 1 and 30' });
        return;
      }
    }
    
    const shareCode = await shareCodeService.generateShareCode(userId, expiryDaysNum);
    
    res.status(201).json(shareCode);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate share code' });
  }
};

export const getShareCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const shareCodes = await shareCodeService.getShareCodesByOwnerId(userId);
    
    res.json(shareCodes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch share codes' });
  }
};

export const deleteShareCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const deleted = await shareCodeService.deleteShareCode(id, userId);
    
    if (!deleted) {
      res.status(404).json({ message: 'Share code not found or you do not have permission to delete it' });
      return;
    }
    
    res.json({ message: 'Share code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete share code' });
  }
};

export const redeemShareCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const userId = req.userId;
    const { shareCodeId } = req.body;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    if (typeof shareCodeId !== 'string') {
      res.status(400).json({ message: 'Share code ID is required' });
      return;
    }
    
    const redeemed = await shareCodeService.redeemShareCode(shareCodeId, userId);
    
    if (!redeemed) {
      res.status(400).json({ message: 'Invalid or expired share code' });
      return;
    }
    
    res.json({ message: 'Share code redeemed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to redeem share code' });
  }
};