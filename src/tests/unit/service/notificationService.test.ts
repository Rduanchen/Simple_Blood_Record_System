import { v4 as uuidv4 } from 'uuid';
import { UserNotificationService, User } from '../../../models';
import { UserNotificationServiceAttributes } from '../../../models/UserNotificationService';
import { getFirebaseMessaging } from '../../../config/firebase';
import { userIdToName } from '../../../services/userService';
import * as notiService from '../../../services/notificationService';
import {
  notificationServiceUserDataMock,
  UserNotificationServiceCreatedReturn,
  expectedNotificationServiceUserData,
  notificationServiceUserData,
} from './notidicationServiceModel';
import { subscribe } from 'diagnostics_channel';
import { messaging } from 'firebase-admin';
import { get } from 'http';

jest.mock('../../../models', () => ({
  UserNotificationService: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    toJSON: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    toJSON: jest.fn(),
  },
}));
jest.mock('../../../config/firebase', () => ({
  getFirebaseMessaging: jest.fn(() => ({
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
  })),
}));
jest.mock('../../../services/userService', () => ({
  userIdToName: jest.fn(),
}));
jest.mock('uuid');
const mockUuidv4 = uuidv4 as jest.Mock;

describe('User Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addNotificationService', () => {
    it('should add a new notification service for a user', async () => {
      //   const mockNotificationService = notificationServiceUserData;
      (User.findByPk as jest.Mock).mockResolvedValue({});
      (UserNotificationService.findOne as jest.Mock).mockResolvedValue(null);
      const messaging = getFirebaseMessaging();
      (messaging.subscribeToTopic as jest.Mock).mockResolvedValue({
        success: 1,
        errors: 0,
      });
      (UserNotificationService.create as jest.Mock).mockResolvedValue(UserNotificationServiceCreatedReturn);
      const result = await notiService.addNotificationService(
        notificationServiceUserDataMock.dataOwnerId,
        notificationServiceUserDataMock.receiverId,
        notificationServiceUserDataMock.notificationId,
      );
      expect(result).toEqual(expectedNotificationServiceUserData.toJSON());
    });
    it('should return null if the user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await notiService.addNotificationService(
        notificationServiceUserDataMock.dataOwnerId,
        notificationServiceUserDataMock.receiverId,
        notificationServiceUserDataMock.notificationId,
      );
      expect(result).toBeNull();
    });
    it('should return null if the notification service already exists', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({});
      (UserNotificationService.findOne as jest.Mock).mockResolvedValue(UserNotificationServiceCreatedReturn);
      const result = await notiService.addNotificationService(
        notificationServiceUserDataMock.dataOwnerId,
        notificationServiceUserDataMock.receiverId,
        notificationServiceUserDataMock.notificationId,
      );
      expect(result).toEqual(UserNotificationServiceCreatedReturn.toJSON());
    });
  });

  describe('getNotificationServicesByOwnerId', () => {
    beforeAll(() => {
      (userIdToName as jest.Mock).mockResolvedValue('John Doe');
    });

    it('should return notification services for a given owner ID', async () => {
      (UserNotificationService.findAll as jest.Mock).mockResolvedValue([notificationServiceUserData]);
      const result = await notiService.getNotificationServicesByOwnerId(notificationServiceUserDataMock.dataOwnerId);
      expect(result).toEqual([
        {
          ...notificationServiceUserData.toJSON(),
          receiverName: notificationServiceUserDataMock.reciverName,
        },
      ]);
    });
    it('should return an empty array if no notification services are found', async () => {
      (UserNotificationService.findAll as jest.Mock).mockResolvedValue([]);
      const result = await notiService.getNotificationServicesByOwnerId(notificationServiceUserDataMock.dataOwnerId);
      expect(result).toEqual([]);
    });
  });

  // describe('getNotificationServicesByReceiverId', () => {
  //   it('should return notification services for a given receiver ID', async () => {
  //     (UserNotificationService.findAll as jest.Mock).mockResolvedValue([notificationServiceUserData]);
  //     const result = await notiService.getNotificationServicesByReceiverId(notificationServiceUserDataMock.receiverId);
  //     expect(result).toEqual([
  //       {
  //         ...notificationServiceUserData.toJSON(),
  //         receiverName: notificationServiceUserDataMock.reciverName,
  //       },
  //     ]);
  //   }
});
