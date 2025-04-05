/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { sync } from '../db/db';
import {
  addRecord,
  findAllData,
  findRecentData,
  findDateAfter,
  updateData,
  deleteData,
  saveuserNotificationService,
  findAllUserNotificationService,
} from '../controllers/data';
import { checkAndSendAlert } from '../controllers/alert';
import { message } from '../controllers/sendNotification';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  res.send('This is api route');
  await sync();
});

router.get('/add', async (req: express.Request, res: express.Response) => {
  const datas = {
    date: parseInt(req.query.date as string),
    systolic: parseInt(req.query.systolic as string),
    diastolic: parseInt(req.query.diastolic as string),
    pulse: parseInt(req.query.pulse as string),
  };
  try {
    const result = await addRecord(datas);
    await checkAndSendAlert({
      systolic: datas.systolic,
      diastolic: datas.diastolic,
      pulse: datas.pulse,
    });
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

router.get('/all', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const result = await findAllData();
    console.log(typeof result);
    console.log(result);
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/recent', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const amount = parseInt(req.query.amount as string);
  try {
    const result = await findRecentData(amount);
    res.json(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/after', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const date = req.query.date as string;
  try {
    const result = await findDateAfter(date);
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/update', async (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  console.log('已經更新');
  const datas = {
    date: parseInt(req.query.date as string),
    systolic: parseInt(req.query.systolic as string),
    diastolic: parseInt(req.query.diastolic as string),
    pulse: parseInt(req.query.pulse as string),
  };
  console.log(datas);
  try {
    await updateData(id, datas);
    res.send({ status: 'success', message: 'Record updated' });
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

router.get('/delete', async (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  try {
    await deleteData(id);
    res.send({ status: 'success', message: 'Record deleted' });
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

router.post('/add-token', async (req, res) => {
  const { token } = req.body;
  console.log('接收到的token:', token);
  const userId = '1';
  if (token == null || userId == null) {
    return res.status(400).json({ error: '缺少必要參數' });
  }

  try {
    await saveuserNotificationService(userId as string, token as string);
    res.status(200).json({ success: true, message: 'Token 已註冊' });
  } catch (error) {
    console.error('註冊 Token 時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// router.get('/send-notification', async (req: express.Request, res: express.Response) => {
//   const bloodPressureData = {
//     systolic: 190,
//     diastolic: 90,
//     pulse: 80,
//   };
//   const userName = '用戶名稱';
//   const tokens = ['token1', 'token2']; // 用戶的通知令牌列表
//   const notifier = new BloodPressureNotifier(userName, tokens);
//   try {
//     await notifier.sendBloodPressureNotification(bloodPressureData);
//     res.send({ status: 'success', message: 'Notification sent' });
//   } catch (error: any) {
//     res.status(500).send({ err: error.message });
//   }
// });

router.get('/test-notification', async (req: express.Request, res: express.Response) => {
  const tokenData = await findAllUserNotificationService();
  const token = tokenData.map((item) => item.notificationId);
  const notification = {
    notification: {
      title: '測試通知',
      body: '這是一個測試通知',
    },
    tokens: token,
  };
  console.log('Sending notification:', notification);
  try {
    const response = await message.sendEachForMulticast(notification);
    console.log('Successfully sent message:', response);
    res.send({ status: 'success', message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    // res.status(500).send({ err: error.message });
  }
});

export default router;
