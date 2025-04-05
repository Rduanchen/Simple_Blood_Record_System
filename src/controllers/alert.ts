import { message } from './sendNotification';
import { findAllUserNotificationService } from './data';

interface ExamResult {
  systolic: 'safe' | 'warning' | 'danger';
  diastolic: 'safe' | 'warning' | 'danger';
  pulse: 'safe' | 'warning' | 'danger';
}

interface BloodPressureData {
  systolic: number;
  diastolic: number;
  pulse: number;
}

interface BloodPressureRanges {
  safeZone?: {
    systolic?: { min: number; max: number };
    diastolic?: { min: number; max: number };
    pulse?: { min: number; max: number };
  };
  warningBasis?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
  };
  dangerBasis?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
  };
}

export default class BloodPressureNotifier {
  private readonly userName: string;
  private readonly tokens: string[];
  private readonly safeZone: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
    pulse: { min: number; max: number };
  };

  private readonly warningBasis: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };

  private readonly dangerBasis: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };

  constructor(userName: string, tokens: string[], ranges?: BloodPressureRanges) {
    this.userName = userName;
    this.tokens = tokens;
    this.safeZone = {
      systolic: ranges?.safeZone?.systolic ?? { min: 90, max: 180 },
      diastolic: ranges?.safeZone?.diastolic ?? { min: 60, max: 90 },
      pulse: ranges?.safeZone?.pulse ?? { min: 60, max: 100 },
    };
    this.warningBasis = {
      systolic: ranges?.warningBasis?.systolic ?? 20,
      diastolic: ranges?.warningBasis?.diastolic ?? 20,
      pulse: ranges?.warningBasis?.pulse ?? 20,
    };
    this.dangerBasis = {
      systolic: ranges?.dangerBasis?.systolic ?? 30,
      diastolic: ranges?.dangerBasis?.diastolic ?? 30,
      pulse: ranges?.dangerBasis?.pulse ?? 30,
    };
  }

  private readonly dangerMessage = {
    body: (situation: string, number: number) => `立刻注意${this.userName}的${situation} 位於危險區間(${number})，請立即處置`,
  };

  private readonly warningMessage = {
    body: (situation: string, number: number) => `${this.userName}的${situation} 位於異常區間(${number})，請注意`,
  };

  private resultCheck(systolic: number, diastolic: number, pulse: number): ExamResult {
    const result: ExamResult = {
      systolic: 'safe',
      diastolic: 'safe',
      pulse: 'safe',
    };

    // systolic
    if (systolic < this.safeZone.systolic.min || systolic > this.safeZone.systolic.max) {
      if (Math.abs(systolic - this.safeZone.systolic.min) > this.dangerBasis.systolic) {
        result.systolic = 'danger';
      }
      if (Math.abs(systolic - this.safeZone.systolic.max) > this.dangerBasis.systolic) {
        result.systolic = 'danger';
      }
      if (Math.abs(systolic - this.safeZone.systolic.min) < this.warningBasis.systolic) {
        result.systolic = 'warning';
      }
      if (Math.abs(systolic - this.safeZone.systolic.max) < this.warningBasis.systolic) {
        result.systolic = 'warning';
      }
    }
    // diastolic
    if (diastolic < this.safeZone.diastolic.min || diastolic > this.safeZone.diastolic.max) {
      if (Math.abs(diastolic - this.safeZone.diastolic.min) > this.dangerBasis.diastolic) {
        result.diastolic = 'danger';
      }
      if (Math.abs(diastolic - this.safeZone.diastolic.max) > this.dangerBasis.diastolic) {
        result.diastolic = 'danger';
      }
      if (Math.abs(diastolic - this.safeZone.diastolic.min) < this.warningBasis.diastolic) {
        result.diastolic = 'warning';
      }
      if (Math.abs(diastolic - this.safeZone.diastolic.max) < this.warningBasis.diastolic) {
        result.diastolic = 'warning';
      }
    }

    // pulse
    if (pulse < this.safeZone.pulse.min || pulse > this.safeZone.pulse.max) {
      if (Math.abs(pulse - this.safeZone.pulse.min) > this.dangerBasis.pulse) {
        result.pulse = 'danger';
      }
      if (Math.abs(pulse - this.safeZone.pulse.max) > this.dangerBasis.pulse) {
        result.pulse = 'danger';
      }
      if (Math.abs(pulse - this.safeZone.pulse.min) < this.warningBasis.pulse) {
        result.pulse = 'warning';
      }
      if (Math.abs(pulse - this.safeZone.pulse.max) < this.warningBasis.pulse) {
        result.pulse = 'warning';
      }
    }
    console.log('血壓檢查結果:', result);
    return result;
  }

  private makeMessage(result: ExamResult, systolic: number, diastolic: number, pulse: number): string[] {
    const messageList: string[] = [];
    if (result.systolic === 'danger') {
      messageList.push(this.dangerMessage.body('收縮壓', systolic));
    } else if (result.systolic === 'warning') {
      messageList.push(this.warningMessage.body('收縮壓', systolic));
    }
    if (result.diastolic === 'danger') {
      messageList.push(this.dangerMessage.body('舒張壓', diastolic));
    } else if (result.diastolic === 'warning') {
      messageList.push(this.warningMessage.body('舒張壓', diastolic));
    }
    if (result.pulse === 'danger') {
      messageList.push(this.dangerMessage.body('脈搏', pulse));
    } else if (result.pulse === 'warning') {
      messageList.push(this.warningMessage.body('脈搏', pulse));
    }
    console.log('生成的通知訊息:', messageList);
    return messageList;
  }

  public async sendBloodPressureNotification(bloodPressureData: BloodPressureData): Promise<boolean> {
    const result = this.resultCheck(bloodPressureData.systolic, bloodPressureData.diastolic, bloodPressureData.pulse);
    const messageList = this.makeMessage(result, bloodPressureData.systolic, bloodPressureData.diastolic, bloodPressureData.pulse);

    if (messageList.length === 0) {
      console.log('Blood pressure is safe, no notification sent.');
      return true;
    }
    const notification = {
      notification: {
        title: `${this.userName}血壓異常`,
        body: messageList.join('\n'),
      },
      tokens: this.tokens,
    };
    console.log('Sending notification:', notification);

    try {
      const response = await message.sendEachForMulticast(notification);
      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

export async function checkAndSendAlert(bloodPressureData: BloodPressureData): Promise<void> {
  const userName = '陳蘇說';
  const tokenData = await findAllUserNotificationService();
  const tokens = tokenData.map((item) => item.notificationId);
  const notifier = new BloodPressureNotifier(userName, tokens);
  await notifier.sendBloodPressureNotification(bloodPressureData);
  console.log('通知已發送');
}
