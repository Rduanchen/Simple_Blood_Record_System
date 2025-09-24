import {
  getAllBloodPressuresByUserId,
  getBloodPressuresPaginated,
  getBloodPressuresByDateRange,
  createBloodPressure,
  updateBloodPressure,
  deleteBloodPressure,
} from '../../../services/bloodPressureService';
import { BloodPressure } from '../../../models';
// import { BloodPressureAttributes } from '../../../models/bloodPressure';
import { verifyAccess } from '../../../services/accessService';
import { v4 as uuidv4 } from 'uuid';
import {
  mockBloodPressureValue,
  expectedBloodPressureValue,
  generalParameter,
  mockBloodPressureDateRangeValue,
  expectedBloodPressureDateRangeValue,
  mockBloodPressureCreateValue,
  expectedBloodPressureCreateValue,
  fakeBloodPressureCreateValue,
} from './bloodPressureServiceModel';
import { Op } from 'sequelize';
import { console } from 'node:inspector';

jest.mock('uuid');
const mockUuidv4 = uuidv4 as jest.Mock;

// 模擬 AccessConfirm 模型
jest.mock('../../../models', () => ({
  BloodPressure: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    toJSON: jest.fn(),
  },
}));
jest.mock('../../../services/accessService', () => ({
  verifyAccess: jest.fn(),
}));

describe('Blood Pressure Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getAllBloodPressuresByUserId', () => {
    it('should return all blood pressure records for a user', async () => {
      const mockBloodPressureData = mockBloodPressureValue;
      (BloodPressure.findAll as jest.Mock).mockResolvedValue(mockBloodPressureData);
      (verifyAccess as jest.Mock).mockResolvedValue(true);
      const userId = generalParameter.userID;
      const requestID = generalParameter.requestID;
      const result = await getAllBloodPressuresByUserId(userId, requestID);
      expect(result).toEqual(expectedBloodPressureValue);
      expect(BloodPressure.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['date', 'DESC']],
      });
    });
  });
  describe('getBloodPressuresPaginated', () => {
    it('should return paginated blood pressure records for a user', async () => {
      const mockBloodPressureData = mockBloodPressureValue;
      (BloodPressure.findAll as jest.Mock).mockResolvedValue(mockBloodPressureData);
      (verifyAccess as jest.Mock).mockResolvedValue(true);
      const userId = generalParameter.userID;
      const requestID = generalParameter.requestID;
      const offset = generalParameter.offset;
      const limit = generalParameter.limit;
      const result = await getBloodPressuresPaginated(userId, requestID, offset, limit);
      expect(result).toEqual(expectedBloodPressureValue);
      expect(BloodPressure.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['date', 'DESC']],
        offset,
        limit,
      });
    });
    it('should return paginated blood pressure records for a user with default offset and limit', async () => {
      const mockBloodPressureData = mockBloodPressureValue;
      (BloodPressure.findAll as jest.Mock).mockResolvedValue(mockBloodPressureData);
      (verifyAccess as jest.Mock).mockResolvedValue(true);
      const userId = generalParameter.userID;
      const requestID = generalParameter.requestID;
      const result = await getBloodPressuresPaginated(userId, requestID);
      expect(result).toEqual(expectedBloodPressureValue);
      expect(BloodPressure.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['date', 'DESC']],
        offset: 0,
        limit: 10,
      });
    });
  });
  describe('getBloodPressuresByDateRange', () => {
    it('should return blood pressure records for a user within a date range', async () => {
      const mockBloodPressureData = mockBloodPressureDateRangeValue;
      (BloodPressure.findAll as jest.Mock).mockResolvedValue(mockBloodPressureData);
      (verifyAccess as jest.Mock).mockResolvedValue(true);
      const userId = generalParameter.userID;
      const requestID = generalParameter.requestID;
      const startDate = generalParameter.queryStartDate;
      const endDate = generalParameter.queryEndDate;
      const result = await getBloodPressuresByDateRange(userId, requestID, startDate, endDate);
      expect(result).toEqual(expectedBloodPressureDateRangeValue);
      expect(BloodPressure.findAll).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['date', 'DESC']],
      });
    });
    it('should return blood pressure records for a user within a date range with default offset and limit', async () => {
      const mockBloodPressureData = mockBloodPressureDateRangeValue;
      (BloodPressure.findAll as jest.Mock).mockResolvedValue(mockBloodPressureData);
      (verifyAccess as jest.Mock).mockResolvedValue(true);
      const userId = generalParameter.userID;
      const requestID = generalParameter.requestID;
      const startDate = generalParameter.queryStartDate;
      const endDate = generalParameter.queryEndDate;
      console.log(mockBloodPressureData, typeof mockBloodPressureData);
      const result = await getBloodPressuresByDateRange(userId, requestID, startDate, endDate);
      expect(result).toEqual(expectedBloodPressureDateRangeValue);
      expect(BloodPressure.findAll).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['date', 'DESC']],
      });
    });
  });
  describe('createBloodPressure', () => {
    it('should create a new blood pressure record', async () => {
      (BloodPressure.create as jest.Mock).mockResolvedValue(mockBloodPressureCreateValue);
      (mockUuidv4 as jest.Mock).mockReturnValue('mocked-uuid');
      const userId = fakeBloodPressureCreateValue.userID;
      const date = fakeBloodPressureCreateValue.date;
      const systolic = fakeBloodPressureCreateValue.systolic;
      const diastolic = fakeBloodPressureCreateValue.diastolic;
      const pulse = fakeBloodPressureCreateValue.pulse;
      const result = await createBloodPressure(userId, date, systolic, diastolic, pulse);
      expect(BloodPressure.create).toHaveBeenCalledWith({
        userId,
        date,
        systolic,
        diastolic,
        pulse,
        id: expect.any(String),
      });
    });
  });
  describe('updateBloodPressure', () => {
    it('should update a blood pressure record', async () => {
      const mockBloodPressureData = {
        ...mockBloodPressureValue[0],
        update: jest.fn().mockResolvedValue(mockBloodPressureValue[0]),
      };
      (BloodPressure.findOne as jest.Mock).mockResolvedValue(mockBloodPressureData);
      const id = mockBloodPressureData.id;
      const userId = mockBloodPressureData.userId;
      const result = await updateBloodPressure(id, userId, {
        date: mockBloodPressureData.date,
        systolic: mockBloodPressureData.systolic,
        diastolic: mockBloodPressureData.diastolic,
        pulse: mockBloodPressureData.pulse,
      });
      expect(result).toEqual(expectedBloodPressureValue[0]);
      expect(BloodPressure.findOne).toHaveBeenCalledWith({
        where: {
          id,
          userId,
        },
      });
      expect(mockBloodPressureData.update).toHaveBeenCalledWith({
        date: mockBloodPressureData.date,
        systolic: mockBloodPressureData.systolic,
        diastolic: mockBloodPressureData.diastolic,
        pulse: mockBloodPressureData.pulse,
      });
    });
    it('should return null if blood pressure record not found', async () => {
      (BloodPressure.findOne as jest.Mock).mockResolvedValue(null);
      const id = 'non-existent-id';
      const userId = 'non-existent-user-id';
      const result = await updateBloodPressure(id, userId, {
        date: new Date(),
        systolic: 120,
        diastolic: 80,
        pulse: 70,
      });
      expect(result).toBeNull();
      expect(BloodPressure.findOne).toHaveBeenCalledWith({
        where: {
          id,
          userId,
        },
      });
    });
  });
  describe('deleteBloodPressure', () => {
    it('should delete a blood pressure record', async () => {
      (BloodPressure.destroy as jest.Mock).mockResolvedValue(1);
      const id = 'mocked-id';
      const userId = 'mocked-user-id';
      const result = await deleteBloodPressure(id, userId);
      expect(result).toBe(true);
      expect(BloodPressure.destroy).toHaveBeenCalledWith({
        where: {
          id,
          userId,
        },
      });
    });
    it('should return false if blood pressure record not found', async () => {
      (BloodPressure.destroy as jest.Mock).mockResolvedValue(0);
      const id = 'non-existent-id';
      const userId = 'non-existent-user-id';
      const result = await deleteBloodPressure(id, userId);
      expect(result).toBe(false);
      expect(BloodPressure.destroy).toHaveBeenCalledWith({
        where: {
          id,
          userId,
        },
      });
    });
  });
});
