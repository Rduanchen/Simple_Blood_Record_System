import { verifyAccess, getAccessList, addAccess, removeAccess, AccessWithUserInfo } from '../../../services/accessService';
import { AccessConfirm } from '../../../models';
import { User } from '../../../models';
import { userIdToName } from '../../../services/userService';
import { AccessConfirmAttributes } from '../../../models/AccessConfirm';
import { UserAttributes } from '../../../models/User';
import { v4 as uuidv4 } from 'uuid';

// 模擬 uuidv4
jest.mock('uuid');
const mockUuidv4 = uuidv4 as jest.Mock;

// 模擬 AccessConfirm 模型
jest.mock('../../../models', () => ({
  AccessConfirm: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
}));
const mockAccessConfirmFindOne = AccessConfirm.findOne as jest.Mock;
const mockAccessConfirmFindAll = AccessConfirm.findAll as jest.Mock;
const mockAccessConfirmCreate = AccessConfirm.create as jest.Mock;
const mockAccessConfirmDestroy = AccessConfirm.destroy as jest.Mock;
const mockUserFindByPk = User.findByPk as jest.Mock;

// 模擬 userService
jest.mock('../../../services/userService', () => ({
  userIdToName: jest.fn(),
}));
const mockUserIdToName = userIdToName as jest.Mock;

describe('Access Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUuidv4.mockReturnValue('mock-uuid');
  });

  describe('verifyAccess', () => {
    it('should return true if access exists', async () => {
      mockAccessConfirmFindOne.mockResolvedValue({});
      const result = await verifyAccess('owner-1', 'user-1');
      expect(result).toBe(true);
      expect(mockAccessConfirmFindOne).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'user-1' },
      });
    });

    it('should return false if access does not exist', async () => {
      mockAccessConfirmFindOne.mockResolvedValue(null);
      const result = await verifyAccess('owner-1', 'user-2');
      expect(result).toBe(false);
      expect(mockAccessConfirmFindOne).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'user-2' },
      });
    });
  });

  describe('getAccessList', () => {
    it('should return an empty array if no access records exist for the data owner', async () => {
      mockAccessConfirmFindAll.mockResolvedValue([]);
      const result = await getAccessList('owner-1');
      expect(result).toEqual([]);
      expect(mockAccessConfirmFindAll).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1' },
        include: [
          {
            model: User,
            as: 'accessableUser',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });
      expect(mockUserIdToName).not.toHaveBeenCalled();
    });

    it('should return a list of access records with user info (user data included)', async () => {
      const mockAccessList = [
        {
          id: 'access-1',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-1',
          accessableUser: { name: 'User One' },
          toJSON: jest.fn().mockReturnValue({
            id: 'access-1',
            dataOwnerId: 'owner-1',
            accessableUserId: 'user-1',
            accessableUser: { name: 'User One' },
          }),
        },
        {
          id: 'access-2',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-2',
          accessableUser: { name: 'User Two' },
          toJSON: jest.fn().mockReturnValue({
            id: 'access-2',
            dataOwnerId: 'owner-1',
            accessableUserId: 'user-2',
            accessableUser: { name: 'User Two' },
          }),
        },
      ] as unknown as AccessConfirm[];
      mockAccessConfirmFindAll.mockResolvedValue(mockAccessList);

      const result = await getAccessList('owner-1');
      expect(result).toEqual([
        { id: 'access-1', dataOwnerId: 'owner-1', accessableUserId: 'user-1', accessableUserName: 'User One' },
        { id: 'access-2', dataOwnerId: 'owner-1', accessableUserId: 'user-2', accessableUserName: 'User Two' },
      ]);
      expect(mockAccessConfirmFindAll).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1' },
        include: [
          {
            model: User,
            as: 'accessableUser',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });
      expect(mockUserIdToName).not.toHaveBeenCalled();
    });

    it('should return a list of access records with user info (user data missing, using userIdToName)', async () => {
      const mockAccessList = [
        {
          id: 'access-1',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-1',
          accessableUser: null,
          createdAt: new Date(),
          toJSON: jest.fn().mockReturnValue({
            id: 'access-1',
            dataOwnerId: 'owner-1',
            accessableUserId: 'user-1',
            accessableUser: null,
          }),
        },
        {
          id: 'access-2',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-2',
          accessableUser: undefined,
          createdAt: new Date(),
          toJSON: jest.fn().mockReturnValue({
            id: 'access-2',
            dataOwnerId: 'owner-1',
            accessableUserId: 'user-2',
            accessableUser: undefined,
          }),
        },
      ] as unknown as AccessConfirm[];
      mockAccessConfirmFindAll.mockResolvedValue(mockAccessList);
      mockUserIdToName.mockResolvedValueOnce('User One From Service').mockResolvedValueOnce('User Two From Service');

      const result = await getAccessList('owner-1');
      expect(result).toEqual([
        {
          id: 'access-1',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-1',
          accessableUserName: 'User One From Service',
          createdAt: expect.any(Date),
        },
        {
          id: 'access-2',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-2',
          accessableUserName: 'User Two From Service',
          createdAt: expect.any(Date),
        },
      ]);
      expect(mockAccessConfirmFindAll).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1' },
        include: [
          {
            model: User,
            as: 'accessableUser',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });
      expect(mockUserIdToName).toHaveBeenCalledTimes(2);
      expect(mockUserIdToName).toHaveBeenCalledWith('user-1');
      expect(mockUserIdToName).toHaveBeenCalledWith('user-2');
    });

    it('should return "Unknown User" if user data is missing and userIdToName returns undefined', async () => {
      const mockAccessList = [
        {
          id: 'access-1',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-1',
          accessableUser: null,
          toJSON: jest.fn().mockReturnValue({
            id: 'access-1',
            dataOwnerId: 'owner-1',
            accessableUserId: 'user-1',
            accessableUser: null,
          }),
        },
      ] as unknown as AccessConfirm[];
      mockAccessConfirmFindAll.mockResolvedValue(mockAccessList);
      mockUserIdToName.mockResolvedValueOnce(undefined);

      const result = await getAccessList('owner-1');
      expect(result).toEqual([{ id: 'access-1', dataOwnerId: 'owner-1', accessableUserId: 'user-1', accessableUserName: 'Unknown User' }]);
    });
  });

  describe('addAccess', () => {
    it('should return null if the user to grant access does not exist', async () => {
      mockUserFindByPk.mockResolvedValue(null);
      const result = await addAccess('owner-1', 'non-existent-user');
      expect(result).toBeNull();
      expect(mockUserFindByPk).toHaveBeenCalledWith('non-existent-user');
      expect(mockAccessConfirmFindOne).not.toHaveBeenCalled();
      expect(mockAccessConfirmCreate).not.toHaveBeenCalled();
    });

    it('should return the existing access if it already exists', async () => {
      const existingAccess = {
        id: 'existing-access-id',
        dataOwnerId: 'owner-1',
        accessableUserId: 'user-1',
        toJSON: jest.fn().mockReturnValue({
          id: 'existing-access-id',
          dataOwnerId: 'owner-1',
          accessableUserId: 'user-1',
        }),
      } as unknown as AccessConfirm;
      mockUserFindByPk.mockResolvedValue({});
      mockAccessConfirmFindOne.mockResolvedValue(existingAccess);
      const result = await addAccess('owner-1', 'user-1');
      expect(result).toEqual({
        id: 'existing-access-id',
        dataOwnerId: 'owner-1',
        accessableUserId: 'user-1',
      });
      expect(mockUserFindByPk).toHaveBeenCalledWith('user-1');
      expect(mockAccessConfirmFindOne).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'user-1' },
      });
      expect(mockAccessConfirmCreate).not.toHaveBeenCalled();
    });

    it('should create a new access and return it if the user exists and access does not exist', async () => {
      const newAccess = {
        id: 'mock-uuid',
        dataOwnerId: 'owner-1',
        accessableUserId: 'new-user',
        toJSON: jest.fn().mockReturnValue({
          id: 'mock-uuid',
          dataOwnerId: 'owner-1',
          accessableUserId: 'new-user',
        }),
      } as unknown as AccessConfirm;
      mockUserFindByPk.mockResolvedValue({});
      mockAccessConfirmFindOne.mockResolvedValue(null);
      mockAccessConfirmCreate.mockResolvedValue(newAccess);
      const result = await addAccess('owner-1', 'new-user');
      expect(result).toEqual({
        id: 'mock-uuid',
        dataOwnerId: 'owner-1',
        accessableUserId: 'new-user',
      });
      expect(mockUserFindByPk).toHaveBeenCalledWith('new-user');
      expect(mockAccessConfirmFindOne).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'new-user' },
      });
      expect(mockAccessConfirmCreate).toHaveBeenCalledWith({
        id: 'mock-uuid',
        dataOwnerId: 'owner-1',
        accessableUserId: 'new-user',
      });
    });
  });

  describe('removeAccess', () => {
    it('should return true if access is successfully removed', async () => {
      mockAccessConfirmDestroy.mockResolvedValue(1);
      const result = await removeAccess('owner-1', 'user-to-remove');
      expect(result).toBe(true);
      expect(mockAccessConfirmDestroy).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'user-to-remove' },
      });
    });

    it('should return false if no access record is found and removed', async () => {
      mockAccessConfirmDestroy.mockResolvedValue(0);
      const result = await removeAccess('owner-1', 'non-existent-user');
      expect(result).toBe(false);
      expect(mockAccessConfirmDestroy).toHaveBeenCalledWith({
        where: { dataOwnerId: 'owner-1', accessableUserId: 'non-existent-user' },
      });
    });
  });
});
