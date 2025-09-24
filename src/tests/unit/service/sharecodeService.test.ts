import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays } from 'date-fns';
import * as shareCodeService from '../../../services/shareCodeService';
import { Op } from 'sequelize';
import { validShareCode, expiredShareCode, shareCodeList, existingAccess, accessConfirmCreated } from '../__mocks__/shareCodeMocks';

jest.mock('../../../models', () => ({
  ShareCode: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
  AccessConfirm: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const { ShareCode, AccessConfirm } = require('../../models');

describe('shareCodeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShareCode', () => {
    it('should generate a new share code', async () => {
      (uuidv4 as jest.Mock).mockReturnValue('new-code-id');
      (ShareCode.create as jest.Mock).mockResolvedValueOnce(validShareCode);
      const result = await shareCodeService.generateShareCode('owner-1', 5);
      expect(ShareCode.create).toHaveBeenCalledWith({
        id: 'new-code-id',
        ownerId: 'owner-1',
        expiresAt: expect.any(Date),
      });
      expect(result).toEqual(validShareCode.toJSON());
    });
  });

  describe('getShareCodesByOwnerId', () => {
    it('should return share codes for the owner', async () => {
      (ShareCode.findAll as jest.Mock).mockResolvedValueOnce(shareCodeList);
      const result = await shareCodeService.getShareCodesByOwnerId('owner-1');
      expect(ShareCode.findAll).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual(shareCodeList.map((c) => c.toJSON()));
    });
  });

  describe('validateShareCode', () => {
    it('should return valid: true for a valid share code', async () => {
      (ShareCode.findByPk as jest.Mock).mockResolvedValueOnce(validShareCode);
      const result = await shareCodeService.validateShareCode('valid-code');
      expect(result).toEqual({ valid: true, ownerId: 'owner-1' });
    });

    it('should return valid: false for an invalid (not found) code', async () => {
      (ShareCode.findByPk as jest.Mock).mockResolvedValueOnce(null);
      const result = await shareCodeService.validateShareCode('notfound-code');
      expect(result).toEqual({ valid: false });
    });

    it('should destroy and return valid: false for an expired code', async () => {
      (ShareCode.findByPk as jest.Mock).mockResolvedValueOnce(expiredShareCode);
      expiredShareCode.destroy.mockResolvedValueOnce(undefined);
      const result = await shareCodeService.validateShareCode('expired-code');
      expect(expiredShareCode.destroy).toHaveBeenCalled();
      expect(result).toEqual({ valid: false });
    });
  });

  describe('deleteShareCode', () => {
    it('should delete the share code and return true', async () => {
      (ShareCode.destroy as jest.Mock).mockResolvedValueOnce(1);
      const result = await shareCodeService.deleteShareCode('valid-code', 'owner-1');
      expect(ShareCode.destroy).toHaveBeenCalledWith({
        where: { id: 'valid-code', ownerId: 'owner-1' },
      });
      expect(result).toBe(true);
    });

    it('should return false if no code was deleted', async () => {
      (ShareCode.destroy as jest.Mock).mockResolvedValueOnce(0);
      const result = await shareCodeService.deleteShareCode('notfound-code', 'owner-1');
      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredShareCodes', () => {
    it('should cleanup expired codes and return the number deleted', async () => {
      (ShareCode.destroy as jest.Mock).mockResolvedValueOnce(2);
      const result = await shareCodeService.cleanupExpiredShareCodes();
      expect(ShareCode.destroy).toHaveBeenCalledWith({
        where: { expiresAt: { [Op.lt]: expect.any(Date) } },
      });
      expect(result).toBe(2);
    });
  });

  describe('redeemShareCode', () => {
    it('should return false if validateShareCode returns invalid', async () => {
      jest.spyOn(shareCodeService, 'validateShareCode').mockResolvedValueOnce({ valid: false });
      const result = await shareCodeService.redeemShareCode('invalid-code', 'user-2');
      expect(result).toBe(false);
    });

    it('should return false if trying to redeem own code', async () => {
      jest.spyOn(shareCodeService, 'validateShareCode').mockResolvedValueOnce({ valid: true, ownerId: 'user-2' });
      const result = await shareCodeService.redeemShareCode('any-code', 'user-2');
      expect(result).toBe(false);
    });

    it('should return true if access already exists', async () => {
      jest.spyOn(shareCodeService, 'validateShareCode').mockResolvedValueOnce({ valid: true, ownerId: 'owner-1' });
      (AccessConfirm.findOne as jest.Mock).mockResolvedValueOnce(existingAccess);
      const result = await shareCodeService.redeemShareCode('valid-code', 'user-2');
      expect(AccessConfirm.findOne).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'user-2' },
      });
      expect(result).toBe(true);
    });

    it('should create access and return true if no access exists', async () => {
      jest.spyOn(shareCodeService, 'validateShareCode').mockResolvedValueOnce({ valid: true, ownerId: 'owner-1' });
      (AccessConfirm.findOne as jest.Mock).mockResolvedValueOnce(null);
      (uuidv4 as jest.Mock).mockReturnValue('new-access-id');
      (AccessConfirm.create as jest.Mock).mockResolvedValueOnce(accessConfirmCreated);
      const result = await shareCodeService.redeemShareCode('valid-code', 'user-2');
      expect(AccessConfirm.create).toHaveBeenCalledWith({
        id: 'new-access-id',
        dataOwnerId: 'owner-1',
        accessableUserId: 'user-2',
      });
      expect(result).toBe(true);
    });
  });
});
