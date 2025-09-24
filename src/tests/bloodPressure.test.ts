import request from 'supertest';
import app from '../app';
import * as bloodPressureService from '../services/bloodPressureService';
import * as safetyMonitorService from '../services/safetyMonitorService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/bloodPressureService');
jest.mock('../services/safetyMonitorService');
jest.mock('../middleware/auth', () => ({
  authenticateJWT: (req: { userId: string }, res: any, next: () => void) => {
    req.userId = 'test-user-id';
    next();
  },
}));

describe('Blood Pressure API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blood-pressure', () => {
    it('should get all blood pressure records', async () => {
      const mockRecords = [
        {
          id: uuidv4(),
          userId: 'test-user-id',
          date: new Date(),
          systolic: 120,
          diastolic: 80,
          pulse: 72,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (bloodPressureService.getAllBloodPressuresByUserId as jest.Mock).mockResolvedValue(mockRecords);

      const response = await request(app).get('/api/blood-pressure').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('systolic', 120);
    });

    it('should return 403 when unauthorized access', async () => {
      (bloodPressureService.getAllBloodPressuresByUserId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));

      const response = await request(app).get('/api/blood-pressure').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'You do not have permission to access this data');
    });
  });

  describe('GET /api/blood-pressure/paginated', () => {
    it('should get paginated blood pressure records', async () => {
      const mockRecords = [
        {
          id: uuidv4(),
          userId: 'test-user-id',
          date: new Date(),
          systolic: 120,
          diastolic: 80,
          pulse: 72,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (bloodPressureService.getBloodPressuresPaginated as jest.Mock).mockResolvedValue(mockRecords);

      const response = await request(app)
        .get('/api/blood-pressure/paginated?offset=0&limit=10')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return 400 with invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/blood-pressure/paginated?offset=-1&limit=0')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/blood-pressure/date-range', () => {
    it('should get records within date range', async () => {
      const mockRecords = [
        {
          id: uuidv4(),
          userId: 'test-user-id',
          date: new Date(),
          systolic: 120,
          diastolic: 80,
          pulse: 72,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (bloodPressureService.getBloodPressuresByDateRange as jest.Mock).mockResolvedValue(mockRecords);

      const response = await request(app)
        .get('/api/blood-pressure/date-range?startDate=2023-01-01&endDate=2023-12-31')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return 400 with invalid date format', async () => {
      const response = await request(app)
        .get('/api/blood-pressure/date-range?startDate=invalid&endDate=invalid')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/blood-pressure', () => {
    it('should create a new blood pressure record', async () => {
      const newRecord = {
        id: uuidv4(),
        userId: 'test-user-id',
        date: new Date().toISOString(),
        systolic: 120,
        diastolic: 80,
        pulse: 72,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bloodPressureService.createBloodPressure as jest.Mock).mockResolvedValue(newRecord);
      (safetyMonitorService.checkBloodPressureAlert as jest.Mock).mockResolvedValue({ warning: false, danger: false });

      const response = await request(app).post('/api/blood-pressure').set('Authorization', 'Bearer valid-token').send({
        date: new Date().toISOString(),
        systolic: 120,
        diastolic: 80,
        pulse: 72,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('systolic', 120);
      expect(safetyMonitorService.checkBloodPressureAlert).toHaveBeenCalled();
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app).post('/api/blood-pressure').set('Authorization', 'Bearer valid-token').send({
        date: 'invalid-date',
        systolic: 'invalid',
        diastolic: 'invalid',
        pulse: 'invalid',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/blood-pressure/:id', () => {
    it('should update a blood pressure record', async () => {
      const updatedRecord = {
        id: 'test-record-id',
        userId: 'test-user-id',
        date: new Date(),
        systolic: 130,
        diastolic: 85,
        pulse: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bloodPressureService.updateBloodPressure as jest.Mock).mockResolvedValue(updatedRecord);
      (safetyMonitorService.checkBloodPressureAlert as jest.Mock).mockResolvedValue({ warning: false, danger: false });

      const response = await request(app).put('/api/blood-pressure/test-record-id').set('Authorization', 'Bearer valid-token').send({
        systolic: 130,
        diastolic: 85,
        pulse: 75,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('systolic', 130);
    });

    it('should return 404 when record not found', async () => {
      (bloodPressureService.updateBloodPressure as jest.Mock).mockResolvedValue(null);

      const response = await request(app).put('/api/blood-pressure/non-existent-id').set('Authorization', 'Bearer valid-token').send({
        systolic: 130,
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/blood-pressure/:id', () => {
    it('should delete a blood pressure record', async () => {
      (bloodPressureService.deleteBloodPressure as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/blood-pressure/test-record-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Blood pressure record deleted successfully');
    });

    it('should return 404 when record not found', async () => {
      (bloodPressureService.deleteBloodPressure as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/blood-pressure/non-existent-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/blood-pressure/import', () => {
    it('should import blood pressure records from CSV', async () => {
      const importResult = {
        imported: 5,
        skipped: 1,
        errors: ['Invalid data in record'],
      };

      (bloodPressureService.importBloodPressuresFromCsv as jest.Mock).mockResolvedValue(importResult);

      // Mock file
      const csvContent = 'date,systolic,diastolic,pulse\n2023-01-01,120,80,72';
      const buffer = Buffer.from(csvContent);

      const response = await request(app)
        .post('/api/blood-pressure/import')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', buffer, 'test.csv');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imported', 5);
      expect(response.body).toHaveProperty('skipped', 1);
    });
  });

  describe('GET /api/blood-pressure/export', () => {
    it('should export blood pressure records to CSV', async () => {
      const filePath = '/tmp/test-export.csv';
      (bloodPressureService.exportBloodPressuresToCsv as jest.Mock).mockResolvedValue(filePath);

      const response = await request(app).get('/api/blood-pressure/export').set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/csv');
    });
  });
});
