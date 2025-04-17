import express from 'express';
import { body, validationResult } from 'express-validator';
import { createNotificationService, deleteNotificationService, getNotificationServicesByUserId } from '../controllers/db/notification';
import { type AuthenticatedRequest, authenticate } from '../middleware/authMiddleware';
import { handleError, handleValidationErrors } from '../utils/errorHandler';
import { asyncHandler } from '../middleware/asyncHandler';
const router = express.Router();

// Apply authentication middleware
router.use(asyncHandler(authenticate));

// Create notification service
router.post(
  '/add',
  [body('notificationId').isString().withMessage('Notification ID must be a string')],
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

      const { notificationId } = req.body;
      const newService = await createNotificationService(userId, { notificationId });
      res.status(201).json(newService);
    } catch (error: any) {
      handleError(res, 500, 'Failed to create notification service', error.message);
    }
  }),
);

// Delete notification service
router.delete(
  '/delete',
  [body('serviceId').isString().withMessage('Service ID must be a string')],
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

      const { serviceId } = req.body;
      if (typeof serviceId !== 'string') {
        handleError(res, 400, 'Invalid service ID');
        return;
      }

      const success = await deleteNotificationService(userId, serviceId);

      if (!success) {
        handleError(res, 404, 'Service not found or no permission to delete');
        return;
      }

      res.status(200).json({ message: 'Notification service deleted successfully' });
    } catch (error: any) {
      handleError(res, 500, 'Failed to delete notification service', error.message);
    }
  }),
);

// Get all notification services
router.get(
  '/all',
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (userId === undefined || userId === null) {
        handleError(res, 401, 'User ID is missing');
        return;
      }
      const services = await getNotificationServicesByUserId(userId);
      res.status(200).json(services);
    } catch (error: any) {
      handleError(res, 500, 'Failed to fetch notification services', error.message);
    }
  }),
);

export default router;
