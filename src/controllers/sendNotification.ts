// send firebase notification
import serviceAccount from '../firebase-admin-config.json';
import { type ServiceAccount } from 'firebase-admin';
import admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const message = admin.messaging();

interface NotificationMessage {
  notification: {
    title: string;
    body: string;
  };
  tokens: string[];
}

export async function sendNotificationToUser(messeage: NotificationMessage): Promise<void> {
  try {
    // 正確構建多用戶推播訊息
    if (messeage.tokens === undefined || messeage.tokens.length === 0) {
      console.error('沒有用戶通知令牌可用於發送通知');
      return;
    }
    const sendMessage = {
      notification: {
        title: messeage.notification.title,
        body: messeage.notification.body,
      },
      tokens: messeage.tokens,
    };
    const response = await message.sendEachForMulticast(sendMessage);
    console.log('成功發送通知:', response);
    console.log(`成功: ${response.successCount}, 失敗: ${response.failureCount}`);
  } catch (error) {
    console.error('發送訊息時出錯:', error);
  }
}
