import { v4 as uuidv4 } from 'uuid';
import SafetyMonitor from '../models/SafetyMonitor';
import { SafetyMonitorAttributes, WarningBasis } from '../models/SafetyMonitor';
import { BloodPressureAttributes } from '../models/BloodPressure';
import { sendNotificationToTopic } from './notificationService';

export const getSafetyMonitorByUserId = async (userId: string): Promise<SafetyMonitorAttributes | null> => {
  const safetyMonitor = await SafetyMonitor.findOne({
    where: {
      userId,
    },
  });

  return (safetyMonitor?.toJSON() as SafetyMonitorAttributes) || null;
};

export const createSafetyMonitor = async (
  userId: string,
  notificationSwitch: boolean = true,
  warningBasis: WarningBasis = { systolic: 140, diastolic: 90, pulse: 100 },
  dangerBasis: WarningBasis = { systolic: 180, diastolic: 120, pulse: 120 },
): Promise<SafetyMonitorAttributes> => {
  const safetyMonitor = await SafetyMonitor.create({
    id: uuidv4(),
    userId,
    notificationSwitch,
    warningBasis,
    dangerBasis,
  });

  return safetyMonitor.toJSON() as SafetyMonitorAttributes;
};

export const updateSafetyMonitor = async (
  userId: string,
  updates: Partial<Omit<SafetyMonitorAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<SafetyMonitorAttributes | null> => {
  const safetyMonitor = await SafetyMonitor.findOne({
    where: {
      userId,
    },
  });

  if (safetyMonitor === null) {
    return null;
  }

  await safetyMonitor.update(updates);

  return safetyMonitor.toJSON() as SafetyMonitorAttributes;
};

export const checkBloodPressureAlert = async (bloodPressure: BloodPressureAttributes): Promise<{ warning: boolean; danger: boolean }> => {
  const safetyMonitor = await getSafetyMonitorByUserId(bloodPressure.userId);

  if (safetyMonitor === null || !safetyMonitor.notificationSwitch) {
    return { warning: false, danger: false };
  }

  const { systolic, diastolic, pulse } = bloodPressure;
  const { warningBasis, dangerBasis } = safetyMonitor;

  const isInDangerZone =
    systolic >= dangerBasis.systolic ||
    diastolic >= dangerBasis.diastolic ||
    pulse >= dangerBasis.pulse ||
    systolic <= 90 ||
    diastolic <= 60;

  const isInWarningZone =
    !isInDangerZone && (systolic >= warningBasis.systolic || diastolic >= warningBasis.diastolic || pulse >= warningBasis.pulse);

  if (isInDangerZone) {
    // Send danger notification
    await sendNotificationToTopic(
      bloodPressure.userId,
      '血壓警報',
      `您的血壓數值極度異常（收縮壓: ${systolic}, 舒張壓: ${diastolic}, 脈搏: ${pulse}）。請立即就醫或尋求幫助！`,
      { type: 'danger', bloodPressureId: bloodPressure.id },
    );
  } else if (isInWarningZone) {
    // Send warning notification
    await sendNotificationToTopic(
      bloodPressure.userId,
      '血壓提醒',
      `您的血壓數值偏高（收縮壓: ${systolic}, 舒張壓: ${diastolic}, 脈搏: ${pulse}）。請注意休息並監測您的狀況。`,
      { type: 'warning', bloodPressureId: bloodPressure.id },
    );
  }

  return {
    warning: isInWarningZone,
    danger: isInDangerZone,
  };
};

// Note: 這部分的系統需要修改
// 最高血壓以及最低血壓都需要有一個警報
