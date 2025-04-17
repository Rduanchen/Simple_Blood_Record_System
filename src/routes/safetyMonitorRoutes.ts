import express from 'express';
import * as safetyMonitorController from '../controllers/safetyMonitorController';
import { authenticateJWT } from '../middleware/auth';
import { safetyMonitorValidator } from '../middleware/validators';

const router = express.Router();

/**
 * @swagger
 * /api/safety-monitor:
 *   get:
 *     summary: Get safety monitor settings
 *     tags: [Safety Monitor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safety monitor settings
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, safetyMonitorController.getSafetyMonitor);

/**
 * @swagger
 * /api/safety-monitor:
 *   put:
 *     summary: Update safety monitor settings
 *     tags: [Safety Monitor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationSwitch:
 *                 type: boolean
 *               warningBasis:
 *                 type: object
 *                 properties:
 *                   systolic:
 *                     type: integer
 *                   diastolic:
 *                     type: integer
 *                   pulse:
 *                     type: integer
 *               dangerBasis:
 *                 type: object
 *                 properties:
 *                   systolic:
 *                     type: integer
 *                   diastolic:
 *                     type: integer
 *                   pulse:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Safety monitor settings updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticateJWT, safetyMonitorValidator, safetyMonitorController.updateSafetyMonitor);

export default router;