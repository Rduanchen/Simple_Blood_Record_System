import express from 'express';
import * as shareCodeController from '../controllers/shareCodeController';
import { authenticateJWT } from '../middleware/auth';
import { shareCodeValidator, redeemShareCodeValidator } from '../middleware/validators';

const router = express.Router();

/**
 * @swagger
 * /api/share-codes:
 *   post:
 *     summary: Generate a new share code
 *     tags: [Share Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiryDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 30
 *     responses:
 *       201:
 *         description: Share code generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, shareCodeValidator, shareCodeController.generateShareCode);

/**
 * @swagger
 * /api/share-codes:
 *   get:
 *     summary: Get all share codes for the current user
 *     tags: [Share Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of share codes
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, shareCodeController.getShareCodes);

/**
 * @swagger
 * /api/share-codes/{id}:
 *   delete:
 *     summary: Delete a share code
 *     tags: [Share Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Share code deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Share code not found
 */
router.delete('/:id', authenticateJWT, shareCodeController.deleteShareCode);

/**
 * @swagger
 * /api/share-codes/redeem:
 *   post:
 *     summary: Redeem a share code
 *     tags: [Share Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareCodeId
 *             properties:
 *               shareCodeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Share code redeemed
 *       400:
 *         description: Invalid or expired share code
 *       401:
 *         description: Unauthorized
 */
router.post('/redeem', authenticateJWT, redeemShareCodeValidator, shareCodeController.redeemShareCode);

export default router;