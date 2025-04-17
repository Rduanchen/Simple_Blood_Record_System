import { body, param, query } from 'express-validator';

export const bloodPressureValidator = [
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('systolic').isInt({ min: 0, max: 300 }).withMessage('Systolic must be a number between 0 and 300'),
  body('diastolic').isInt({ min: 0, max: 200 }).withMessage('Diastolic must be a number between 0 and 200'),
  body('pulse').isInt({ min: 0, max: 300 }).withMessage('Pulse must be a number between 0 and 300'),
];

export const updateBloodPressureValidator = [
  param('id').isUUID().withMessage('Blood pressure ID must be a valid UUID'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('systolic').optional().isInt({ min: 0, max: 300 }).withMessage('Systolic must be a number between 0 and 300'),
  body('diastolic').optional().isInt({ min: 0, max: 200 }).withMessage('Diastolic must be a number between 0 and 200'),
  body('pulse').optional().isInt({ min: 0, max: 300 }).withMessage('Pulse must be a number between 0 and 300'),
];

export const safetyMonitorValidator = [
  body('notificationSwitch').optional().isBoolean().withMessage('Notification switch must be a boolean'),
  body('warningBasis').optional().isObject().withMessage('Warning basis must be an object'),
  body('warningBasis.systolic').optional().isInt({ min: 0, max: 300 }).withMessage('Systolic must be a number between 0 and 300'),
  body('warningBasis.diastolic').optional().isInt({ min: 0, max: 200 }).withMessage('Diastolic must be a number between 0 and 200'),
  body('warningBasis.pulse').optional().isInt({ min: 0, max: 300 }).withMessage('Pulse must be a number between 0 and 300'),
  body('dangerBasis').optional().isObject().withMessage('Danger basis must be an object'),
  body('dangerBasis.systolic').optional().isInt({ min: 0, max: 300 }).withMessage('Systolic must be a number between 0 and 300'),
  body('dangerBasis.diastolic').optional().isInt({ min: 0, max: 200 }).withMessage('Diastolic must be a number between 0 and 200'),
  body('dangerBasis.pulse').optional().isInt({ min: 0, max: 300 }).withMessage('Pulse must be a number between 0 and 300'),
];

export const shareCodeValidator = [
  body('expiryDays').optional().isInt({ min: 1, max: 30 }).withMessage('Expiry days must be a number between 1 and 30'),
];

export const redeemShareCodeValidator = [
  body('shareCodeId').isUUID().withMessage('Share code ID must be a valid UUID'),
];

export const notificationServiceValidator = [
  body('receiverId').isUUID().withMessage('Receiver ID must be a valid UUID'),
  body('notificationId').isString().withMessage('Notification ID must be a string'),
];

export const dateRangeValidator = [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

export const userProfileValidator = [
  body('name').isString().notEmpty().withMessage('Name is required and must be a string'),
];