import request from 'supertest';
import app from '../app';
import * as notificationService from '../services/notificationService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/notificationService');
jest.mock('../middleware/auth', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  },
}));

describe('Notification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/notifications', () => {
    it('should add a notification service', async () => {
      const mockService = {
        id: uuidv4(),
        dataOwnerId: 'test-user-id',
        receiverId: 'another-user-id',
        notificationId: 'fcm-token-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notificationService.addNotificationService as jest.Mock).mockResolvedValue(mockService);

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', 'Bearer valid-token')
        .send({
          receiverId: 'another-user-id',
          notificationId: 'fcm-token-123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('notificationId', 'fcm-token-123');
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', 'Bearer valid-token')
        .send({
          receiverId: 'another-user-id',
          // Missing notificationId
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 when user not found', async () => {
      (notificationService.addNotificationService as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', 'Bearer valid-token')
        .send({
          receiverId: 'non-existent-user-id',
          notificationId: 'fcm-token-123',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/notifications', () => {
    it('should get all notification services', async () => {
      const mockServices = [
        {
          id: uuidv4(),
          dataOwnerId: 'test-user-id',
          receiverId: 'another-user-id',
          receiverName: 'Another User',
          notificationId: 'fcm-token-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (notificationService.getNotificationServicesByOwnerId as jest.Mock).mockResolvedValue(mockServices);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('receiverName', 'Another User');
    });
  });

  describe('DELETE /api/notifications/id/:notificationId', () => {
    it('should remove a notification service by ID', async () => {
      (notificationService.removeNotificationServiceById as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/notifications/id/fcm-token-123')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Notification service removed successfully');
    });

    it('should return 404 when notification service not found', async () => {
      (notificationService.removeNotificationServiceById as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/notifications/id/non-existent-token')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/notifications/receiver/:receiverId', () => {
    it('should remove all notification services for a receiver', async () => {
      (notificationService.removeNotificationService as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/notifications/receiver/another-user-id')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Notification service removed successfully');
    });

    it('should return 404 when notification services not found', async () => {
      (notificationService.removeNotificationService as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/notifications/receiver/non-existent-user-id')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/notifications/test', () => {
    it('should send a test notification', async () => {
      (notificationService.sendNotificationToTopic as jest.Mock).mockResolvedValue('message-id-123');

      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Test notification sent successfully');
      expect(notificationService.sendNotificationToTopic).toHaveBeenCalledWith(
        'test-user-id',
        '測試通知',
        '這是一則測試通知，用於確認您的通知服務正常運作。',
        { type: 'test' }
      );
    });
  });
});