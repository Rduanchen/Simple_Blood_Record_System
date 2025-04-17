import express from 'express';
import { body, query, validationResult } from 'express-validator';
import {
  getAllBloodPressuresByUserId,
  getBloodPressuresByUserIdPaginated,
  getBloodPressuresByDateRange,
  createBloodPressure,
  updateBloodPressure,
  deleteBloodPressure,
  type BloodPressureData,
} from '../controllers/db/bloodPressureService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { handleError, handleValidationErrors } from '../utils/errorHandler';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Apply authentication middleware
router.use(asyncHandler(authenticate));

// Create blood pressure record
router.post(
  '/add',
  [
    body('date').isISO8601().withMessage('Invalid date format'),
    body('systolic').isInt({ min: 50, max: 250 }).withMessage('Systolic must be between 50 and 250'),
    body('diastolic').isInt({ min: 30, max: 150 }).withMessage('Diastolic must be between 30 and 150'),
    body('pulse').isInt({ min: 30, max: 220 }).withMessage('Pulse must be between 30 and 220'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    // Validate request body
    const errors = validationResult(req);
    if (handleValidationErrors(res, errors)) return;

    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const { date, systolic, diastolic, pulse } = req.body;
    const newRecord = await createBloodPressure(userId, { date, systolic, diastolic, pulse });
    res.status(201).json(newRecord);
  }),
);

// Get all blood pressure records
router.get(
  '/all',
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const records = await getAllBloodPressuresByUserId(userId);
    res.status(200).json(records);
  }),
);

// Get paginated blood pressure records
router.get(
  '/recent',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    // Validate query parameters
    const errors = validationResult(req);
    if (handleValidationErrors(res, errors)) return;

    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const limit = req.query.limit !== undefined ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset !== undefined ? parseInt(req.query.offset as string) : 0;

    const records = await getBloodPressuresByUserIdPaginated(userId, { limit, offset });
    res.status(200).json(records);
  }),
);

// Get blood pressure records by date range
router.get(
  '/range',
  [
    query('startDate').isISO8601().withMessage('Start date must be in ISO format'),
    query('endDate').isISO8601().withMessage('End date must be in ISO format'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    // Validate query parameters
    const errors = validationResult(req);
    if (handleValidationErrors(res, errors)) return;

    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const records = await getBloodPressuresByDateRange(userId, new Date(startDate), new Date(endDate));
    res.status(200).json(records);
  }),
);

// Update blood pressure record
router.put(
  '/update',
  [
    body('recordId').isString().withMessage('Record ID must be a string'),
    body('data').isObject().withMessage('Data must be an object'),
    body('data.systolic').optional().isInt({ min: 50, max: 250 }).withMessage('Systolic must be between 50 and 250'),
    body('data.diastolic').optional().isInt({ min: 30, max: 150 }).withMessage('Diastolic must be between 30 and 150'),
    body('data.pulse').optional().isInt({ min: 30, max: 220 }).withMessage('Pulse must be between 30 and 220'),
    body('data.date').optional().isISO8601().withMessage('Invalid date format'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    // Validate request body
    const errors = validationResult(req);
    if (handleValidationErrors(res, errors)) return;

    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const { recordId, data } = req.body as { recordId: string; data: any };
    // Ensure data is properly typed
    const typedData = data as Partial<BloodPressureData>;

    const updatedRecord = await updateBloodPressure(userId, recordId, typedData);

    if (updatedRecord === null || updatedRecord === undefined) {
      handleError(res, 404, 'Record not found or no permission to update');
      return;
    }

    res.status(200).json(updatedRecord);
  }),
);

// Delete blood pressure record
router.delete(
  '/delete',
  [body('recordId').isString().withMessage('Record ID must be a string')],
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
    // Validate request body
    const errors = validationResult(req);
    if (handleValidationErrors(res, errors)) return;

    const userId = req.user?.id;
    if (userId === undefined || userId === null) {
      handleError(res, 401, 'User ID is missing');
      return;
    }

    const { recordId } = req.body;
    const success = await deleteBloodPressure(userId, recordId as string);

    if (!success) {
      handleError(res, 404, 'Record not found or no permission to delete');
      return;
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  }),
);

export default router;
