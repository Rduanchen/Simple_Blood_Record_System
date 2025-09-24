import request from 'supertest';
import app from '../app';
import * as accessService from '../services/accessService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/accessService');
jest.mock('../middleware/auth', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  },
}));

describe('Access API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/access', () => {
    it('should get access list for user', async () => {
      const mockAccessList = [
        {
          id: uuidv4(),
          dataOwnerId: 'test-user-id',
          accessableUserId: 'another-user-id',
          accessableUserName: 'Another User',
          createdAt: new Date(),
        },
      ];

      (accessService.getAccessList as jest.Mock).mockResolvedValue(mockAccessList);

      const response = await request(app).get('/api/access').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('accessableUserName', 'Another User');
    });
  });

  describe('DELETE /api/access/:accessableUserId', () => {
    it('should remove access for a user', async () => {
      (accessService.removeAccess as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/access/another-user-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Access removed successfully');
    });

    it('should return 404 when access not found', async () => {
      (accessService.removeAccess as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/access/non-existent-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/access/verify/:dataOwnerId', () => {
    it('should verify access to data owner', async () => {
      (accessService.verifyAccess as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get('/api/access/verify/another-user-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hasAccess', true);
    });

    it('should return true when verifying access to own data', async () => {
      const response = await request(app).get('/api/access/verify/test-user-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hasAccess', true);
      // Verify that verifyAccess was not called since it's own data
      expect(accessService.verifyAccess).not.toHaveBeenCalled();
    });

    it('should return false when no access', async () => {
      (accessService.verifyAccess as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get('/api/access/verify/another-user-id').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hasAccess', false);
    });
  });
});
