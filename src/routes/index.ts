import express from 'express';
import userRoutes from './userRoutes';
import bloodPressureRoutes from './bloodPressureRoutes';
import safetyMonitorRoutes from './safetyMonitorRoutes';
import shareCodeRoutes from './shareCodeRoutes';
import accessRoutes from './accessRoutes';
import notificationRoutes from './notificationRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/blood-pressure', bloodPressureRoutes);
router.use('/safety-monitor', safetyMonitorRoutes);
router.use('/share-codes', shareCodeRoutes);
router.use('/access', accessRoutes);
router.use('/notifications', notificationRoutes);

export default router;