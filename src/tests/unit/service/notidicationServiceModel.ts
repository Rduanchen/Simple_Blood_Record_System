import { v4 as uuidv4 } from 'uuid';

export const notificationServiceUserDataMock = {
  dataOwnerId: 'dataOwnerID',
  receiverId: 'receiverID',
  notificationId: 'notificationID',
  reciverName: 'John Doe',
  reciverEmail: 'user@example.com',
};

export const UserNotificationServiceCreatedReturn = {
  id: uuidv4(),
  notificationId: notificationServiceUserDataMock.notificationId,
  dataOwnerId: notificationServiceUserDataMock.dataOwnerId,
  receiverId: notificationServiceUserDataMock.receiverId,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () {
    return {
      id: this.id,
      notificationId: this.notificationId,
      dataOwnerId: this.dataOwnerId,
      receiverId: this.receiverId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

export const expectedNotificationServiceUserData = {
  id: UserNotificationServiceCreatedReturn.id,
  notificationId: UserNotificationServiceCreatedReturn.notificationId,
  dataOwnerId: UserNotificationServiceCreatedReturn.dataOwnerId,
  receiverId: UserNotificationServiceCreatedReturn.receiverId,
  createdAt: UserNotificationServiceCreatedReturn.createdAt,
  updatedAt: UserNotificationServiceCreatedReturn.updatedAt,
  toJSON: function () {
    return {
      id: this.id,
      notificationId: this.notificationId,
      dataOwnerId: this.dataOwnerId,
      receiverId: this.receiverId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

export const notificationServiceUserData = {
  id: uuidv4(),
  notificationId: notificationServiceUserDataMock.notificationId,
  dataOwnerId: notificationServiceUserDataMock.dataOwnerId,
  receiverId: notificationServiceUserDataMock.receiverId,
  createdAt: new Date(),
  updatedAt: new Date(),
  receiver: {
    id: notificationServiceUserDataMock.receiverId,
    name: notificationServiceUserDataMock.reciverName,
    email: notificationServiceUserDataMock.reciverEmail,
  },
  dataOwner: {
    id: notificationServiceUserDataMock.dataOwnerId,
    name: notificationServiceUserDataMock.reciverName,
    email: notificationServiceUserDataMock.reciverEmail,
  },
  toJSON: function () {
    return {
      id: this.id,
      notificationId: this.notificationId,
      dataOwnerId: this.dataOwnerId,
      receiverId: this.receiverId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      receiver: this.receiver,
      dataOwner: this.dataOwner,
    };
  },
};
