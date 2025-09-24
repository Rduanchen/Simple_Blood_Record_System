import request from 'supertest';
import app from '../app';
import * as shareCodeService from '../services/shareCodeService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/shareCodeService');
jest.mock('../middleware/auth', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  },
}));

describe('Share Code API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/share-codes', () => {
    it('should generate a new share code', async () => {
      const mockShareCode = {
        id: uuidv4(),
        ownerId: 'test-user-id',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      (shareCodeService.generateShareCode as jest.Mock).mockResolvedValue(mockShareCode);

      const response = await request(app)
        .post('/api/share-codes')
        .set('Authorization', 'Bearer valid-token')
        .send({ expiryDays: 7 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('ownerId', 'test-user-id');
      expect(shareCodeService.generateShareCode).toHaveBeenCalledWith('test-user-id', 7);
    });

    it('should return 400 with invalid expiry days', async () => {
      const response = await request(app)
        .post('/api/share-codes')
        .set('Authorization', 'Bearer valid-token')
        .send({ expiryDays: 50 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/share-codes', () => {
    it('should get all share codes for user', async () => {
      const mockShareCodes = [
        {
          id: uuidv4(),
          ownerId: 'test-user-id',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ];

      (shareCodeService.getShareCodesByOwnerId as jest.Mock).mockResolvedValue(mockShareCodes);

      const response = await request(app)
        .get('/api/share-codes')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('ownerId', 'test-user-id');
    });
  });

  describe('DELETE /api/share-codes/:id', () => {
    it('should delete a share code', async () => {
      (shareCodeService.deleteShareCode as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/share-codes/test-share-code-id')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Share code deleted successfully');
    });

    it('should return 404 when share code not found', async () => {
      (shareCodeService.deleteShareCode as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/share-codes/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/share-codes/redeem', () => {
    it('should redeem a share code', async () => {
      (shareCodeService.redeemShareCode as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/share-codes/redeem')
        .set('Authorization', 'Bearer valid-token')
        .send({ shareCodeId: uuidv4() });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Share code redeemed successfully');
    });

    it('should return 400 when share code is invalid', async () => {
      (shareCodeService.redeemShareCode as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/share-codes/redeem')
        .set('Authorization', 'Bearer valid-token')
        .send({ shareCodeId: uuidv4() });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid or expired share code');
    });
  });
});