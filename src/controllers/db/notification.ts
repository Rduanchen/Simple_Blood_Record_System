import { UserNotificationService } from '../../db/models';
import { v4 as uuidv4 } from 'uuid';

interface NotificationServiceData {
  notificationId: string;
}

interface NotificationServiceRecord extends NotificationServiceData {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 新增通知服務
 */
export async function createNotificationService(userId: string, serviceData: NotificationServiceData): Promise<NotificationServiceRecord> {
  const service = await UserNotificationService.create({
    id: uuidv4(),
    userId,
    ...serviceData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return service as unknown as NotificationServiceRecord;
}

/**
 * 刪除通知服務（確認為該使用者的才可以刪除）
 */
export async function deleteNotificationService(userId: string, serviceId: string): Promise<boolean> {
  const service = await UserNotificationService.findOne({
    where: {
      id: serviceId,
      userId,
    },
  });

  if (service == null) {
    return false;
  }

  await service.destroy();
  return true;
}

/**
 * 查詢使用者擁有的所有通知服務
 */
export async function getNotificationServicesByUserId(userId: string): Promise<NotificationServiceRecord[]> {
  const services = await UserNotificationService.findAll({
    where: { userId },
  });

  return services as unknown as NotificationServiceRecord[];
}

/**
 * 根據ID獲取單個通知服務（確認為該使用者的）
 */
export async function getNotificationServiceById(userId: string, serviceId: string): Promise<NotificationServiceRecord | null> {
  const service = await UserNotificationService.findOne({
    where: {
      id: serviceId,
      userId,
    },
  });

  return service as unknown as NotificationServiceRecord | null;
}

/**
 * 更新通知服務（確認為該使用者的才可以更新）
 */
export async function updateNotificationService(
  userId: string,
  serviceId: string,
  serviceData: Partial<NotificationServiceData>,
): Promise<NotificationServiceRecord | null> {
  const service = await UserNotificationService.findOne({
    where: {
      id: serviceId,
      userId,
    },
  });

  if (service == null) {
    return null;
  }

  await service.update(serviceData);
  return service as unknown as NotificationServiceRecord;
}
