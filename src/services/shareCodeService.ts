import { v4 as uuidv4 } from 'uuid';
import { ShareCode, AccessConfirm, User } from '../models';
import { ShareCodeAttributes } from '../models/ShareCode';
import { AccessConfirmAttributes } from '../models/AccessConfirm';
import { UserAttributes } from '../models/User';
import { addDays } from 'date-fns';
import { Op } from 'sequelize';

export const generateShareCode = async (ownerId: string, expiryDays: number = 7): Promise<ShareCodeAttributes> => {
  const expiresAt = addDays(new Date(), expiryDays);

  const shareCode = await ShareCode.create({
    id: uuidv4(),
    ownerId,
    expiresAt,
  });

  return shareCode.toJSON() as ShareCodeAttributes;
};

export const getShareCodesByOwnerId = async (ownerId: string): Promise<ShareCodeAttributes[]> => {
  const shareCodes = await ShareCode.findAll({
    where: {
      ownerId,
    },
    order: [['createdAt', 'DESC']],
  });

  return shareCodes.map((code) => code.toJSON()) as ShareCodeAttributes[];
};

export const validateShareCode = async (shareCodeId: string): Promise<{ valid: boolean; ownerId?: string }> => {
  const shareCode = await ShareCode.findByPk(shareCodeId);

  if (shareCode === null) {
    return { valid: false };
  }

  // Check if the share code has expired
  if (new Date() > shareCode.expiresAt) {
    await shareCode.destroy();
    return { valid: false };
  }

  return {
    valid: true,
    ownerId: shareCode.ownerId,
  };
};

export const deleteShareCode = async (shareCodeId: string, ownerId: string): Promise<boolean> => {
  const deleted = await ShareCode.destroy({
    where: {
      id: shareCodeId,
      ownerId,
    },
  });

  return deleted > 0;
};

export const cleanupExpiredShareCodes = async (): Promise<number> => {
  const deleted = await ShareCode.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date(),
      },
    },
  });

  return deleted;
};

export const redeemShareCode = async (shareCodeId: string, userId: string): Promise<boolean> => {
  const result = await validateShareCode(shareCodeId);

  if (!result.valid || result.ownerId === undefined) {
    return false;
  }

  // Don't allow self-access
  if (result.ownerId === userId) {
    return false;
  }

  // Check if access already exists
  const existingAccess = await AccessConfirm.findOne({
    where: {
      dataOwnerId: result.ownerId,
      accessableUserId: userId,
    },
  });

  if (existingAccess !== null) {
    // Access already exists, don't need to create again
    return true;
  }

  // Create access confirmation
  await AccessConfirm.create({
    id: uuidv4(),
    dataOwnerId: result.ownerId,
    accessableUserId: userId,
  });

  // // Delete the share code after redemption
  // await ShareCode.destroy({
  //   where: {
  //     id: shareCodeId,
  //   },
  // });

  return true;
};
