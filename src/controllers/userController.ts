import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firebaseToken } = req.body;
    
    if (typeof firebaseToken !== 'string') {
      res.status(400).json({ message: 'Firebase token is required' });
      return;
    }
    
    const result = await userService.loginOrSignUp(firebaseToken);
    
    if (result === null) {
      res.status(401).json({ message: 'Invalid firebase token' });
      return;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process login' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const user = await userService.getUserById(userId);
    
    if (user === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Don't send firebaseUid back to client
    const { firebaseUid, ...userProfile } = user;
    
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { name } = req.body;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    
    const updatedUser = await userService.updateUserName(userId, name);
    
    if (updatedUser === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Don't send firebaseUid back to client
    const { firebaseUid, ...userProfile } = updatedUser;
    
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user profile' });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (userId === undefined) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }
    
    const deleted = await userService.deleteUser(userId);
    
    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user account' });
  }
};