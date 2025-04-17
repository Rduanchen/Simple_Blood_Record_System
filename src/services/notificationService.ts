import { v4 as uuidv4 } from 'uuid';
import { UserNotificationService, User } from '../models';
import { UserNotificationServiceAttributes } from '../models/UserNotificationService';
import { getFirebaseMessaging } from '../config/firebase';
import { userIdToName } from './userService';

export interface NotificationServiceWithUserInfo extends UserNotificationServiceAttributes {
  receiverName: string;
}

export interface NotificationServiceWithUserInfoAndOwner extends UserNotificationServiceAttributes {
  dataOwnerName: string;
}

export const addNotificationService = async (
  dataOwnerId: string,
  receiverId: string,
  notificationId: string,
): Promise<UserNotificationServiceAttributes | null> => {
  // Check if users exist
  const dataOwner = await User.findByPk(dataOwnerId);
  const receiver = await User.findByPk(receiverId);

  if (dataOwner === null || receiver === null) {
    return null;
  }

  // Check if service already exists
  const existingService = await UserNotificationService.findOne({
    where: {
      dataOwnerId,
      receiverId,
      notificationId,
    },
  });

  if (existingService !== null) {
    return existingService.toJSON() as UserNotificationServiceAttributes;
  }

  // Subscribe to topic in Firebase
  const messaging = getFirebaseMessaging();
  await messaging.subscribeToTopic(notificationId, dataOwnerId);

  // Create new service
  const service = await UserNotificationService.create({
    id: uuidv4(),
    dataOwnerId,
    receiverId,
    notificationId,
  });

  return service.toJSON() as UserNotificationServiceAttributes;
};

export const getNotificationServicesByOwnerId = async (dataOwnerId: string): Promise<NotificationServiceWithUserInfo[]> => {
  const services = await UserNotificationService.findAll({
    where: {
      dataOwnerId,
    },
    include: [
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return Promise.all(
    services.map(async (service) => {
      const serviceJson = service.toJSON() as UserNotificationServiceAttributes & {
        receiver?: { name: string };
      };

      return {
        ...serviceJson,
        receiverName: serviceJson.receiver?.name || (await userIdToName(serviceJson.receiverId)) || 'Unknown User',
      };
    }),
  );
};

export const getNotificationServicesByReceiverId = async (receiverId: string): Promise<NotificationServiceWithUserInfoAndOwner[]> => {
  const services = await UserNotificationService.findAll({
    where: {
      receiverId,
    },
    include: [
      {
        model: User,
        as: 'dataOwner',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return Promise.all(
    services.map(async (service) => {
      const serviceJson = service.toJSON() as UserNotificationServiceAttributes & {
        dataOwner?: { name: string };
      };

      return {
        ...serviceJson,
        dataOwnerName: serviceJson.dataOwner?.name || (await userIdToName(serviceJson.dataOwnerId)) || 'Unknown User',
      };
    }),
  );
};

export const removeNotificationServiceById = async (notificationId: string): Promise<boolean> => {
  const service = await UserNotificationService.findOne({
    where: {
      notificationId,
    },
  });

  if (service === null) {
    return false;
  }

  // Unsubscribe from topic in Firebase
  const messaging = getFirebaseMessaging();
  await messaging.unsubscribeFromTopic(service.notificationId, service.dataOwnerId);

  // Delete the service
  await service.destroy();

  return true;
};

export const removeNotificationService = async (dataOwnerId: string, receiverId: string): Promise<boolean> => {
  const services = await UserNotificationService.findAll({
    where: {
      dataOwnerId,
      receiverId,
    },
  });

  if (services.length === 0) {
    return false;
  }

  // Unsubscribe from topics in Firebase
  const messaging = getFirebaseMessaging();

  for (const service of services) {
    await messaging.unsubscribeFromTopic(service.notificationId, service.dataOwnerId);
    await service.destroy();
  }

  return true;
};

export const sendNotificationToTopic = async (
  topic: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
): Promise<string> => {
  const messaging = getFirebaseMessaging();

  const message = {
    notification: {
      title,
      body,
    },
    data,
    topic,
  };

  return messaging.send(message);
};

export const sendNotificationToTokens = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {},
): Promise<string[]> => {
  if (tokens.length === 0) {
    return [];
  }

  const messaging = getFirebaseMessaging();

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  const response = await messaging.sendMulticast(message);

  return response.responses.map((res, idx) => (res.success ? tokens[idx] : null)).filter((token): token is string => token !== null);
};
