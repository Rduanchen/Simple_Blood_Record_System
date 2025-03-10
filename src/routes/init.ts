import express from 'express';
import { createBloodPressureTable } from '../db/init';

const router = express.Router();
router.get('/', (req, res) => {
  createBloodPressureTable();
  res.send('Database initialized');
});

export default router;
