import request from 'supertest';
import app from '../app';
import * as safetyMonitorService from '../services/safetyMonitorService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/safetyMonitorService');
jest.mock('../middleware/auth', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  },
}));

describe('Safety Monitor API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/safety-monitor', () => {
    it('should get safety monitor settings', async () => {
      const mockSettings = {
        id: uuidv4(),
        userId: 'test-user-id',
        notificationSwitch: true,
        warningBasis: { systolic: 140, diastolic: 90, pulse: 100 },
        dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (safetyMonitorService.getSafetyMonitorByUserId as jest.Mock).mockResolvedValue(mockSettings);

      const response = await request(app)
        .get('/api/safety-monitor')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notificationSwitch', true);
      expect(response.body.warningBasis).toHaveProperty('systolic', 140);
    });

    it('should create default settings if not found', async () => {
      const mockDefaultSettings = {
        id: uuidv4(),
        userId: 'test-user-id',
        notificationSwitch: true,
        warningBasis: { systolic: 140, diastolic: 90, pulse: 100 },
        dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (safetyMonitorService.getSafetyMonitorByUserId as jest.Mock).mockResolvedValue(null);
      (safetyMonitorService.createSafetyMonitor as jest.Mock).mockResolvedValue(mockDefaultSettings);

      const response = await request(app)
        .get('/api/safety-monitor')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notificationSwitch', true);
      expect(safetyMonitorService.createSafetyMonitor).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('PUT /api/safety-monitor', () => {
    it('should update safety monitor settings', async () => {
      const mockUpdatedSettings = {
        id: uuidv4(),
        userId: 'test-user-id',
        notificationSwitch: false,
        warningBasis: { systolic: 150, diastolic: 95, pulse: 100 },
        dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (safetyMonitorService.updateSafetyMonitor as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const response = await request(app)
        .put('/api/safety-monitor')
        .set('Authorization', 'Bearer valid-token')
        .send({
          notificationSwitch: false,
          warningBasis: { systolic: 150, diastolic: 95, pulse: 100 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notificationSwitch', false);
      expect(response.body.warningBasis).toHaveProperty('systolic', 150);
    });

    it('should create settings if not found', async () => {
      const mockNewSettings = {
        id: uuidv4(),
        userId: 'test-user-id',
        notificationSwitch: false,
        warningBasis: { systolic: 150, diastolic: 95, pulse: 100 },
        dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (safetyMonitorService.updateSafetyMonitor as jest.Mock).mockResolvedValue(null);
      (safetyMonitorService.createSafetyMonitor as jest.Mock).mockResolvedValue(mockNewSettings);

      const response = await request(app)
        .put('/api/safety-monitor')
        .set('Authorization', 'Bearer valid-token')
        .send({
          notificationSwitch: false,
          warningBasis: { systolic: 150, diastolic: 95, pulse: 100 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notificationSwitch', false);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .put('/api/safety-monitor')
        .set('Authorization', 'Bearer valid-token')
        .send({
          warningBasis: { systolic: 'invalid', diastolic: 'invalid', pulse: 'invalid' },
        });

      expect(response.status).toBe(400);
    });
  });
});