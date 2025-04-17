import { Request, Response } from 'express';
import * as accessService from '../services/accessService';
import { validationResult } from 'express-validator';

export const getAccessList = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const accessList = await accessService.getAccessList(userId);
    
    res.json(accessList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch access list' });
  }
};

export const removeAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { accessableUserId } = req.params;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const removed = await accessService.removeAccess(userId, accessableUserId);
    
    if (!removed) {
      res.status(404).json({ message: 'Access not found or already removed' });
      return;
    }
    
    res.json({ message: 'Access removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove access' });
  }
};

export const verifyUserAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { dataOwnerId } = req.params;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    // If user is checking access to their own data, always return true
    if (userId === dataOwnerId) {
      res.json({ hasAccess: true });
      return;
    }
    
    const hasAccess = await accessService.verifyAccess(dataOwnerId, userId);
    
    res.json({ hasAccess });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify access' });
  }
};