import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import { validationResult } from 'express-validator';

export const addNotificationService = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const userId = req.userId;
    const { receiverId, notificationId } = req.body;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    if (typeof receiverId !== 'string' || typeof notificationId !== 'string') {
      res.status(400).json({ message: 'Receiver ID and notification ID are required' });
      return;
    }
    
    const service = await notificationService.addNotificationService(userId, receiverId, notificationId);
    
    if (service === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add notification service' });
  }
};

export const getNotificationServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const services = await notificationService.getNotificationServicesByOwnerId(userId);
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notification services' });
  }
};

export const removeNotificationServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    
    const removed = await notificationService.removeNotificationServiceById(notificationId);
    
    if (!removed) {
      res.status(404).json({ message: 'Notification service not found' });
      return;
    }
    
    res.json({ message: 'Notification service removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove notification service' });
  }
};

export const removeNotificationService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { receiverId } = req.params;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const removed = await notificationService.removeNotificationService(userId, receiverId);
    
    if (!removed) {
      res.status(404).json({ message: 'Notification service not found' });
      return;
    }
    
    res.json({ message: 'Notification service removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove notification service' });
  }
};

export const sendTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    await notificationService.sendNotificationToTopic(
      userId,
      '測試通知',
      '這是一則測試通知，用於確認您的通知服務正常運作。',
      { type: 'test' }
    );
    
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send test notification' });
  }
};