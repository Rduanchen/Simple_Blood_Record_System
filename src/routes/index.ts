import express from 'express';
import { syncDatabase } from '../db/database';
import bloodPressureRoutes from './bloodPressure';
import notificationRoutes from './notification';
import userRoutes from './user';

import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Test and database sync route
router.get(
  '/sync',
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      await syncDatabase();
      res.status(200).send('Database sync completed successfully');
    } catch (error: any) {
      res.status(500).json({ error: 'Database sync failed', details: error.message });
    }
  }),
);

// Register route modules
router.use('/blood-pressure', bloodPressureRoutes);
router.use('/notification', notificationRoutes);
router.use('/user', userRoutes);

export default router;
