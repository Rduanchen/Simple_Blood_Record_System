import express from 'express';
import * as accessController from '../controllers/accessController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/access:
 *   get:
 *     summary: Get list of users who have access to current user's data
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of access permissions
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, accessController.getAccessList);

/**
 * @swagger
 * /api/access/{accessableUserId}:
 *   delete:
 *     summary: Remove access for a user
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accessableUserId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Access removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Access not found
 */
router.delete('/:accessableUserId', authenticateJWT, accessController.removeAccess);

/**
 * @swagger
 * /api/access/verify/{dataOwnerId}:
 *   get:
 *     summary: Verify if current user has access to another user's data
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dataOwnerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Access verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasAccess:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/verify/:dataOwnerId', authenticateJWT, accessController.verifyUserAccess);

export default router;