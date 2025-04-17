import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, updateUserData, deleteUser } from '../controllers/db/userService';
import { type AuthenticatedRequest, authenticate } from '../middleware/authMiddleware';
import { handleError, handleValidationErrors } from '../utils/errorHandler';
import { asyncHandler } from '../middleware/asyncHandler';

// Define the UserData interface based on the expected fields
interface UserData {
  email?: string;
  name?: string;
  preferences?: Record<string, unknown>;
  // Add any other fields that might be part of the UserData type
}

const router = express.Router();

// Create user (no authentication required)
router.post(
  '/add',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('firebaseUid').isString().notEmpty().withMessage('Firebase UID is required'),
  ],
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (handleValidationErrors(res, errors)) return;

      const { email, name, firebaseUid } = req.body;
      const newUser = await createUser({ email, name, firebaseUid });
      res.status(201).json(newUser);
    } catch (error: any) {
      handleError(res, 500, 'Failed to create user', error.message);
    }
  }),
);

// Authentication required for the remaining routes
router.use(asyncHandler(authenticate));

// Update user
router.put(
  '/update',
  [
    body('data').isObject().withMessage('Data must be an object'),
    body('data.email').optional().isEmail().withMessage('Valid email is required'),
    body('data.name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('data.preferences').optional().isObject().withMessage('Preferences must be an object'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (handleValidationErrors(res, errors)) return;

      const userId = req.user?.id;
      if (userId === undefined || userId === null) {
        handleError(res, 401, 'User ID is missing');
        return;
      }

      const { data } = req.body;
      const updatedUser = await updateUserData(userId, data as Partial<UserData>);

      if (updatedUser === null) {
        handleError(res, 404, 'User not found or no permission to update');
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error: any) {
      handleError(res, 500, 'Failed to update user', error.message);
    }
  }),
);

// Delete user
router.delete(
  '/delete',
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (userId === undefined || userId === null) {
        handleError(res, 401, 'User ID is missing');
        return;
      }

      const success = await deleteUser(userId);

      if (!success) {
        handleError(res, 404, 'User not found or no permission to delete');
        return;
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      handleError(res, 500, 'Failed to delete user', error.message);
    }
  }),
);

// FIXME
router.get(
  '/getID',
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (userId === undefined || userId === null) {
        handleError(res, 401, 'User ID is missing');
        return;
      }

      res.status(200).json({ userId });
    } catch (error: any) {
      handleError(res, 500, 'Failed to get user ID', error.message);
    }
  }),
);

export default router;
