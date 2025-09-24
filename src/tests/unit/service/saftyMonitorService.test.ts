import {
  getSafetyMonitorByUserId,
  createSafetyMonitor,
  updateSafetyMonitor,
  checkBloodPressureAlert,
} from '../../../services/safetyMonitorService';

import { v4 as uuidv4 } from 'uuid';
import SafetyMonitor from '../../../models/SafetyMonitor';
import { sendNotificationToTopic } from '../../../services/notificationService';
import * as safetyMonitorService from '../../../services/safetyMonitorService';

jest.mock('../../../models/SafetyMonitor', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../../services/notificationService', () => ({
  sendNotificationToTopic: jest.fn(),
}));
jest.mock('uuid');

const mockUuidv4 = uuidv4 as jest.Mock;

const mockSafetyMonitor = {
  id: 'mock-id',
  userId: 'user-id',
  notificationSwitch: true,
  warningBasis: { systolic: 140, diastolic: 90, pulse: 100 },
  dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () {
    return {
      id: this.id,
      userId: this.userId,
      notificationSwitch: this.notificationSwitch,
      warningBasis: this.warningBasis,
      dangerBasis: this.dangerBasis,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

const mockBloodPressureNormal = {
  id: 'bp-normal',
  userId: 'user-id',
  date: new Date(),
  systolic: 130,
  diastolic: 80,
  pulse: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBloodPressureWarning = {
  id: 'bp-warning',
  userId: 'user-id',
  date: new Date(),
  systolic: 145,
  diastolic: 95,
  pulse: 105,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBloodPressureDanger = {
  id: 'bp-danger',
  userId: 'user-id',
  date: new Date(),
  systolic: 185,
  diastolic: 130,
  pulse: 125,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('safetyMonitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSafetyMonitorByUserId', () => {
    it('should return the safety monitor for the given user', async () => {
      (SafetyMonitor.findOne as jest.Mock).mockResolvedValueOnce(mockSafetyMonitor);
      const result = await safetyMonitorService.getSafetyMonitorByUserId('user-id');
      expect(result).toEqual(mockSafetyMonitor.toJSON());
      expect(SafetyMonitor.findOne).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
    });

    it('should return null if no safety monitor is found', async () => {
      (SafetyMonitor.findOne as jest.Mock).mockResolvedValueOnce(null);
      const result = await safetyMonitorService.getSafetyMonitorByUserId('user-id');
      expect(result).toBeNull();
    });
  });

  describe('createSafetyMonitor', () => {
    it('should create and return a new safety monitor', async () => {
      mockUuidv4.mockReturnValue('mock-id');
      (SafetyMonitor.create as jest.Mock).mockResolvedValueOnce(mockSafetyMonitor);
      const result = await safetyMonitorService.createSafetyMonitor('user-id');
      expect(result).toEqual(mockSafetyMonitor.toJSON());
      expect(SafetyMonitor.create).toHaveBeenCalledWith({
        id: 'mock-id',
        userId: 'user-id',
        notificationSwitch: true,
        warningBasis: { systolic: 140, diastolic: 90, pulse: 100 },
        dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
      });
    });
  });

  describe('updateSafetyMonitor', () => {
    it('should update and return the updated safety monitor', async () => {
      const mockUpdate = jest.fn().mockResolvedValueOnce(undefined);
      const mockMonitor = { ...mockSafetyMonitor, update: mockUpdate };
      (SafetyMonitor.findOne as jest.Mock).mockResolvedValueOnce(mockMonitor);
      const result = await safetyMonitorService.updateSafetyMonitor('user-id', { notificationSwitch: false });
      expect(mockUpdate).toHaveBeenCalledWith({ notificationSwitch: false });
      expect(result).toEqual(mockSafetyMonitor.toJSON());
    });

    it('should return null if no safety monitor is found', async () => {
      (SafetyMonitor.findOne as jest.Mock).mockResolvedValueOnce(null);
      const result = await safetyMonitorService.updateSafetyMonitor('user-id', { notificationSwitch: false });
      expect(result).toBeNull();
    });
  });

  describe('checkBloodPressureAlert', () => {
    beforeEach(() => {
      jest.spyOn(safetyMonitorService, 'getSafetyMonitorByUserId').mockImplementation(async (userId: string) => {
        if (userId === 'user-id') return mockSafetyMonitor.toJSON();
        return null;
      });
    });

    it('should return { warning: false, danger: false } and send no notification for normal values', async () => {
      const result = await safetyMonitorService.checkBloodPressureAlert(mockBloodPressureNormal as any);
      expect(result).toEqual({ warning: false, danger: false });
      expect(sendNotificationToTopic).not.toHaveBeenCalled();
    });

    it('should send a warning notification and return { warning: true, danger: false } for warning zone', async () => {
      const result = await safetyMonitorService.checkBloodPressureAlert(mockBloodPressureWarning as any);
      expect(result).toEqual({ warning: true, danger: false });
      expect(sendNotificationToTopic).toHaveBeenCalledWith(
        mockBloodPressureWarning.userId,
        '血壓提醒',
        `您的血壓數值偏高（收縮壓: ${mockBloodPressureWarning.systolic}, 舒張壓: ${mockBloodPressureWarning.diastolic}, 脈搏: ${mockBloodPressureWarning.pulse}）。請注意休息並監測您的狀況。`,
        { type: 'warning', bloodPressureId: mockBloodPressureWarning.id },
      );
    });

    it('should send a danger notification and return { warning: false, danger: true } for danger zone', async () => {
      const result = await safetyMonitorService.checkBloodPressureAlert(mockBloodPressureDanger as any);
      expect(result).toEqual({ warning: false, danger: true });
      expect(sendNotificationToTopic).toHaveBeenCalledWith(
        mockBloodPressureDanger.userId,
        '血壓警報',
        `您的血壓數值極度異常（收縮壓: ${mockBloodPressureDanger.systolic}, 舒張壓: ${mockBloodPressureDanger.diastolic}, 脈搏: ${mockBloodPressureDanger.pulse}）。請立即就醫或尋求幫助！`,
        { type: 'danger', bloodPressureId: mockBloodPressureDanger.id },
      );
    });

    it('should return { warning: false, danger: false } if safety monitor is null', async () => {
      (safetyMonitorService.getSafetyMonitorByUserId as jest.Mock).mockResolvedValueOnce(null);
      const result = await safetyMonitorService.checkBloodPressureAlert({ ...mockBloodPressureNormal, userId: 'not-exist' } as any);
      expect(result).toEqual({ warning: false, danger: false });
      expect(sendNotificationToTopic).not.toHaveBeenCalled();
    });

    it('should return { warning: false, danger: false } if notificationSwitch is false', async () => {
      jest.spyOn(safetyMonitorService, 'getSafetyMonitorByUserId').mockResolvedValueOnce({
        ...mockSafetyMonitor.toJSON(),
        notificationSwitch: false,
      });
      const result = await safetyMonitorService.checkBloodPressureAlert(mockBloodPressureDanger as any);
      expect(result).toEqual({ warning: false, danger: false });
      expect(sendNotificationToTopic).not.toHaveBeenCalled();
    });
  });
});
