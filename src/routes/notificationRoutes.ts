import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';
import { notificationServiceValidator } from '../middleware/validators';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Register a notification service
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - notificationId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *               notificationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification service registered
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/', authenticateJWT, notificationServiceValidator, notificationController.addNotificationService);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notification services for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notification services
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, notificationController.getNotificationServices);

/**
 * @swagger
 * /api/notifications/id/{notificationId}:
 *   delete:
 *     summary: Remove a notification service by notification ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification service removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification service not found
 */
router.delete('/id/:notificationId', authenticateJWT, notificationController.removeNotificationServiceById);

/**
 * @swagger
 * /api/notifications/receiver/{receiverId}:
 *   delete:
 *     summary: Remove all notification services for a receiver
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification services removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification services not found
 */
router.delete('/receiver/:receiverId', authenticateJWT, notificationController.removeNotificationService);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent
 *       401:
 *         description: Unauthorized
 */
router.post('/test', authenticateJWT, notificationController.sendTestNotification);

export default router;