/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { sync } from '../db/db';
import admin from 'firebase-admin';
import {
  addRecord,
  findAllData,
  findRecentData,
  findDateAfter,
  updateData,
  deleteData,
  saveuserNotificationService,
  // findAllUserNotificationService,
} from '../controllers/data';
import axios from 'axios';

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
  console.log(datas);
  try {
    const result = await addRecord(datas);
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

router.post('/register-token', async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (token == null || userId == null) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 更新或建立新的 token 記錄
    await saveuserNotificationService(userId as string, token as string);

    res.status(200).json({ success: true, message: 'Token 已註冊' });
  } catch (error) {
    console.error('註冊 Token 時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// router.get('/test-send-messeage', async (req, res) => {
//   const result = await findAllUserNotificationService();
//   const tokens = result.map((item) => item.notificationId);
//   const message = {
//     notification: {
//       title: '測試標題',
//       body: '測試內容',
//     },
//     data: {
//       key1: 'value1',
//       key2: 'value2',
//     },
//     token: tokens,
//   };
//   try {
//     const response = await admin.messaging().sendMulticast(message);
//     console.log('Successfully sent message:', response);
//     res.status(200).json({ success: true, response });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: 'Error sending message' });
//   }
// });

export default router;
