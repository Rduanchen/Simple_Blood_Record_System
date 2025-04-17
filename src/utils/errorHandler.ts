import { type Response } from 'express';
import { type ValidationError, type Result } from 'express-validator';

// Standard error handler
export const handleError = (res: Response, status: number, message: string, details?: any): void => {
  res.status(status).json({ error: message, details });
};

// Validation error handler
export const handleValidationErrors = (res: Response, errors: Result<ValidationError>): boolean => {
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: (err as any).param, // 'param' is the correct property for the field name in express-validator
        message: err.msg,
        value: (err as any).value, // Cast to 'any' to access 'value' if it exists
      })),
    });
    return true;
  }
  return false;
};
