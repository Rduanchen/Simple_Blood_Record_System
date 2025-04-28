import { v4 as uuidv4 } from 'uuid';
import { AccessConfirm, User } from '../models';
import { AccessConfirmAttributes } from '../models/AccessConfirm';
import { UserAttributes } from '../models/User';
import { userIdToName } from './userService';

export interface AccessWithUserInfo extends AccessConfirmAttributes {
  accessableUserName: string;
}

export const verifyAccess = async (dataOwnerId: string, accessableUserId: string): Promise<boolean> => {
  const access = await AccessConfirm.findOne({
    where: {
      dataOwnerId,
      accessableUserId,
    },
  });

  return access !== null;
};

export const getAccessList = async (dataOwnerId: string): Promise<AccessWithUserInfo[]> => {
  const accessList = await AccessConfirm.findAll({
    where: {
      dataOwnerId,
    },
    include: [
      {
        model: User,
        as: 'accessableUser',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return Promise.all(
    accessList.map(async (access) => {
      const accessJson = access.toJSON() as AccessConfirmAttributes & { accessableUser?: { name: string } };
      const value = {
        id: access.id,
        dataOwnerId: access.dataOwnerId,
        accessableUserId: access.accessableUserId,
        createdAt: access.createdAt,
        accessableUserName: accessJson.accessableUser?.name || (await userIdToName(accessJson.accessableUserId)) || 'Unknown User',
      } as AccessWithUserInfo;
      return value;
    }),
  );
};

export const addAccess = async (dataOwnerId: string, accessableUserId: string): Promise<AccessConfirmAttributes | null> => {
  // Check if user exists
  const user = await User.findByPk(accessableUserId);

  if (user === null) {
    return null;
  }

  // Check if access already exists
  const existingAccess = await AccessConfirm.findOne({
    where: {
      dataOwnerId,
      accessableUserId,
    },
  });

  if (existingAccess !== null) {
    return existingAccess.toJSON() as AccessConfirmAttributes;
  }

  // Create new access
  const access = await AccessConfirm.create({
    id: uuidv4(),
    dataOwnerId,
    accessableUserId,
  });

  return access.toJSON() as AccessConfirmAttributes;
};

export const removeAccess = async (dataOwnerId: string, accessableUserId: string): Promise<boolean> => {
  const deleted = await AccessConfirm.destroy({
    where: {
      dataOwnerId,
      accessableUserId,
    },
  });

  return deleted > 0;
};
