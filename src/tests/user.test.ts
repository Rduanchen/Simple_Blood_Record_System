import request from 'supertest';
import app from '../app';
import { User } from '../models';
import * as userService from '../services/userService';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../services/userService');
jest.mock('../config/firebase');

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/login', () => {
    it('should login a user with valid Firebase token', async () => {
      const mockUser = {
        id: uuidv4(),
        email: 'test@example.com',
        name: 'Test User',
        firebaseUid: 'firebase123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      (userService.loginOrSignUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const response = await request(app).post('/api/users/login').send({ firebaseToken: 'valid-firebase-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token', mockToken);
      expect(userService.loginOrSignUp).toHaveBeenCalledWith('valid-firebase-token');
    });

    it('should return 401 with invalid Firebase token', async () => {
      (userService.loginOrSignUp as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/users/login').send({ firebaseToken: 'invalid-firebase-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid firebase token');
    });

    it('should return 400 when Firebase token is missing', async () => {
      const response = await request(app).post('/api/users/login').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Firebase token is required');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const mockUser = {
        id: uuidv4(),
        email: 'test@example.com',
        name: 'Test User',
        firebaseUid: 'firebase123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/profile').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockUser.id);
      expect(response.body).toHaveProperty('email', mockUser.email);
      expect(response.body).toHaveProperty('name', mockUser.name);
      expect(response.body).not.toHaveProperty('firebaseUid');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app).get('/api/users/profile').send();

      expect(response.status).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/users/profile').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const mockUser = {
        id: uuidv4(),
        email: 'test@example.com',
        name: 'Updated User',
        firebaseUid: 'firebase123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.updateUserName as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated User');
      expect(response.body).not.toHaveProperty('firebaseUid');
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app).put('/api/users/profile').set('Authorization', 'Bearer valid-token').send({ name: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete user account', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/users/account').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User account deleted successfully');
    });

    it('should return 404 when user not found', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/users/account').set('Authorization', 'Bearer valid-token').send();

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });
});
