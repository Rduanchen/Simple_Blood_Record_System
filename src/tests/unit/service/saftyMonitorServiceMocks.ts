import { v4 as uuidv4 } from 'uuid';
import { SafetyMonitorAttributes } from '../../../models/SafetyMonitor';
import { BloodPressureAttributes } from '../../../models/BloodPressure';

export const mockSafetyMonitor: SafetyMonitorAttributes = {
  id: uuidv4(),
  userId: 'test-user-id',
  notificationSwitch: true,
  warningBasis: { systolic: 140, diastolic: 90, pulse: 100 },
  dangerBasis: { systolic: 180, diastolic: 120, pulse: 120 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBloodPressureNormal: BloodPressureAttributes = {
  id: uuidv4(),
  userId: 'test-user-id',
  date: new Date(),
  systolic: 130,
  diastolic: 85,
  pulse: 75,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBloodPressureWarning: BloodPressureAttributes = {
  id: uuidv4(),
  userId: 'test-user-id',
  date: new Date(),
  systolic: 145,
  diastolic: 95,
  pulse: 105,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBloodPressureDanger: BloodPressureAttributes = {
  id: uuidv4(),
  userId: 'test-user-id',
  date: new Date(),
  systolic: 185,
  diastolic: 125,
  pulse: 130,
  createdAt: new Date(),
  updatedAt: new Date(),
};
