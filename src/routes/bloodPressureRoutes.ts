import express from 'express';
import * as bloodPressureController from '../controllers/bloodPressureController';
import { authenticateJWT } from '../middleware/auth';
import { 
  bloodPressureValidator, 
  updateBloodPressureValidator,
  dateRangeValidator
} from '../middleware/validators';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/blood-pressure:
 *   get:
 *     summary: Get all blood pressure records for the current user
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of blood pressure records
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, bloodPressureController.getAllBloodPressures);

/**
 * @swagger
 * /api/blood-pressure/paginated:
 *   get:
 *     summary: Get paginated blood pressure records
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Paginated list of blood pressure records
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/paginated', authenticateJWT, bloodPressureController.getBloodPressuresPaginated);

/**
 * @swagger
 * /api/blood-pressure/date-range:
 *   get:
 *     summary: Get blood pressure records within a date range
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of blood pressure records within the date range
 *       400:
 *         description: Invalid date format
 *       401:
 *         description: Unauthorized
 */
router.get('/date-range', authenticateJWT, dateRangeValidator, bloodPressureController.getBloodPressuresByDateRange);

/**
 * @swagger
 * /api/blood-pressure:
 *   post:
 *     summary: Create a new blood pressure record
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - systolic
 *               - diastolic
 *               - pulse
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               systolic:
 *                 type: integer
 *               diastolic:
 *                 type: integer
 *               pulse:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Blood pressure record created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, bloodPressureValidator, bloodPressureController.createBloodPressure);

/**
 * @swagger
 * /api/blood-pressure/{id}:
 *   put:
 *     summary: Update a blood pressure record
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               systolic:
 *                 type: integer
 *               diastolic:
 *                 type: integer
 *               pulse:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Blood pressure record updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
router.put('/:id', authenticateJWT, updateBloodPressureValidator, bloodPressureController.updateBloodPressure);

/**
 * @swagger
 * /api/blood-pressure/{id}:
 *   delete:
 *     summary: Delete a blood pressure record
 *     tags: [Blood Pressure]
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
 *         description: Blood pressure record deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
router.delete('/:id', authenticateJWT, bloodPressureController.deleteBloodPressure);

/**
 * @swagger
 * /api/blood-pressure/import:
 *   post:
 *     summary: Import blood pressure records from CSV
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import results
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post('/import', authenticateJWT, upload.single('file'), bloodPressureController.importFromCsv);

/**
 * @swagger
 * /api/blood-pressure/export:
 *   get:
 *     summary: Export blood pressure records as CSV
 *     tags: [Blood Pressure]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get('/export', authenticateJWT, bloodPressureController.exportToCsv);

export default router;