/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response, type NextFunction } from 'express';
import { syncDatabase } from '../db/database';
import {
  getAllBloodPressuresByUserId,
  getBloodPressuresByUserIdPaginated,
  getBloodPressuresByDateRange,
  createBloodPressure,
  updateBloodPressure,
  deleteBloodPressure,
  // BloodPressureData,
} from '../controllers/db/bloodPressureService';
import { createNotificationService, deleteNotificationService, getNotificationServicesByUserId } from '../controllers/db/notification';
import { createUser, updateUserData, deleteUser } from '../controllers/db/userService';

const router = express.Router();

// 定義 Request 中使用者的類型
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    deviceId: string;
  };
}

// 中間件驗證 Firebase Token 與自定義 Token
router.use(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const firebaseToken = req.headers['firebase-token'] as string;
    const customToken = req.headers['custom-token'] as string;

    if (firebaseToken === undefined || customToken === undefined) {
      res.status(401).json({ error: '缺少驗證 Token' });
      return;
    }

    // 驗證 Firebase Token（這裡假設已經有 Firebase 驗證邏輯）
    const decodedFirebaseToken = verifyFirebaseToken(firebaseToken); // 假設此函數存在
    const decodedCustomToken = decodeCustomToken(customToken); // 假設此函數存在

    if (decodedFirebaseToken === null || decodedCustomToken === null) {
      res.status(401).json({ error: '驗證失敗' });
      return;
    }

    req.user = {
      id: decodedCustomToken.id,
      username: decodedCustomToken.username,
      deviceId: decodedCustomToken.deviceId,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: '驗證失敗', details: error.message });
  }
});

// 測試路由
router.get('/sync', async (req: Request, res: Response): Promise<void> => {
  res.send('This is api route');
  await syncDatabase();
});

// 新增血壓紀錄
router.post('/blood-pressure/add', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { date, systolic, diastolic, pulse } = req.body;
  const userId = req.user?.id;

  try {
    if (userId === undefined) {
      res.status(401).json({ error: '缺少使用者 ID' });
      return;
    }
    const newRecord = await createBloodPressure(userId, { date, systolic, diastolic, pulse });
    res.status(201).json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: '新增失敗', details: error.message });
  }
});

// 取得所有血壓紀錄
router.get('/blood-pressure/all', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (userId === undefined) {
      res.status(401).json({ error: '缺少使用者 ID' });
      return;
    }
    const records = await getAllBloodPressuresByUserId(userId);
    res.status(200).json(records);
  } catch (error: any) {
    res.status(500).json({ error: '查詢失敗', details: error.message });
  }
});

// 取得分頁血壓紀錄
router.get('/blood-pressure/recent', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit as string);
  const offset = req.query.offset === undefined ? 0 : parseInt(req.query.offset as string);

  try {
    if (userId === undefined) {
      res.status(401).json({ error: '缺少使用者 ID' });
      return;
    }
    const records = await getBloodPressuresByUserIdPaginated(userId, { limit, offset });
    res.status(200).json(records);
  } catch (error: any) {
    res.status(500).json({ error: '查詢失敗', details: error.message });
  }
});

// 根據日期範圍查詢血壓紀錄
router.get('/blood-pressure/range', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { startDate, endDate } = req.query;

  try {
    if (userId === undefined) {
      res.status(401).json({ error: '缺少使用者 ID' });
      return;
    }
    const records = await getBloodPressuresByDateRange(userId, new Date(startDate as string), new Date(endDate as string));
    res.status(200).json(records);
  } catch (error: any) {
    res.status(500).json({ error: '查詢失敗', details: error.message });
  }
});

// 更新血壓紀錄
router.put('/blood-pressure/update', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { recordId, data } = req.body;
  if (userId === undefined) {
    res.status(401).json({ error: '缺少使用者 ID' });
    return;
  }
  if (recordId === undefined || data === undefined) {
    res.status(400).json({ error: '缺少紀錄ID' });
    return;
  }

  // 檢查資料格式
  if (typeof data !== 'object' || data === null) {
    res.status(400).json({ error: '資料格式錯誤' });
    return;
  }
  if (typeof data.systolic !== 'number' || typeof data.diastolic !== 'number' || typeof data.pulse !== 'number') {
    res.status(400).json({ error: '資料格式錯誤' });
    return;
  }

  if (data.date !== undefined && typeof data.date !== 'string') {
    res.status(400).json({ error: '日期格式錯誤' });
    return;
  }
  if (typeof recordId !== 'string') {
    res.status(400).json({ error: '紀錄ID必須是字串' });
    return;
  }
  try {
    const updatedRecord = await updateBloodPressure(userId, recordId, data);
    if (updatedRecord === null) {
      res.status(404).json({ error: '紀錄不存在或無權限' });
      return;
    }
    res.status(200).json(updatedRecord);
  } catch (error: any) {
    res.status(500).json({ error: '更新失敗', details: error.message });
  }
});

// 刪除血壓紀錄
router.delete('/blood-pressure/delete', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { recordId } = req.body;
  if (typeof recordId !== 'string') {
    res.status(400).json({ error: '紀錄ID必須是字串' });
    return;
  }
  if (userId === undefined) {
    res.status(401).json({ error: '缺少使用者 ID' });
    return;
  }
  if (recordId === undefined) {
    res.status(400).json({ error: '缺少紀錄ID' });
    return;
  }

  try {
    const success = await deleteBloodPressure(userId, recordId);
    if (!success) {
      res.status(404).json({ error: '紀錄不存在或無權限' });
      return;
    }
    res.status(200).json({ message: '刪除成功' });
  } catch (error: any) {
    res.status(500).json({ error: '刪除失敗', details: error.message });
  }
});

// 新增通知服務
router.post('/notification/add', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.status(400).json({ error: '缺少使用者 ID' });
    return;
  }

  const { notificationId } = req.body;

  if (notificationId === undefined) {
    res.status(400).json({ error: '缺少必要的參數 (notificationId)' });
    return;
  }

  try {
    const newService = await createNotificationService(userId, { notificationId });
    res.status(201).json(newService);
  } catch (error: any) {
    res.status(500).json({ error: '新增失敗', details: error.message });
  }
});

// 刪除通知服務
router.delete('/notification/delete', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.status(400).json({ error: '缺少使用者 ID' });
    return;
  }

  const { serviceId } = req.body;

  if (serviceId === undefined) {
    res.status(400).json({ error: '缺少必要的參數 (serviceId)' });
    return;
  }

  try {
    const success = await deleteNotificationService(userId, serviceId);
    if (success) {
      res.status(404).json({ error: '服務不存在或無權限' });
      return;
    }
    res.status(200).json({ message: '刪除成功' });
  } catch (error: any) {
    res.status(500).json({ error: '刪除失敗', details: error.message });
  }
});

// 查詢使用者通知服務
router.get('/notification/all', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.status(400).json({ error: '缺少使用者 ID' });
    return;
  }

  try {
    const services = await getNotificationServicesByUserId(userId);
    res.status(200).json(services);
  } catch (error: any) {
    res.status(500).json({ error: '查詢失敗', details: error.message });
  }
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    deviceId: string;
  };
}

// 新增使用者
router.post('/user/add', async (req: Request, res: Response): Promise<void> => {
  const { email, name, firebaseUid } = req.body;

  if (email === undefined || name === undefined || firebaseUid === undefined) {
    res.status(400).json({ error: '缺少必要的參數 (email, name 或 firebaseUid)' });
    return;
  }

  try {
    const newUser = await createUser({ email, name, firebaseUid });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: '新增失敗', details: error.message });
  }
});

// 更新使用者資料
router.put('/user/update', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.status(400).json({ error: '缺少使用者 ID' });
    return;
  }
  const { data } = req.body;
  if (data === undefined) {
    res.status(400).json({ error: '缺少必要的參數 (data)' });
    return;
  }
  if (typeof data !== 'object' || data === null) {
    res.status(400).json({ error: '資料格式錯誤' });
    return;
  }

  try {
    const updatedUser = await updateUserData(userId, data);
    if (updatedUser === null) {
      res.status(404).json({ error: '使用者不存在或無權限' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: '更新失敗', details: error.message });
  }
});

// 刪除使用者
router.delete('/user/delete', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.status(400).json({ error: '缺少使用者 ID' });
    return;
  }

  try {
    const success = await deleteUser(userId);
    if (!success) {
      res.status(404).json({ error: '使用者不存在或無權限' });
      return;
    }
    res.status(200).json({ message: '刪除成功' });
  } catch (error: any) {
    res.status(500).json({ error: '刪除失敗', details: error.message });
  }
});

// 假設的驗證與解碼函數
function verifyFirebaseToken(token: string): { uid: string } {
  // 模擬 Firebase Token 驗證
  return { uid: 'firebase-uid-123' };
}

function decodeCustomToken(token: string): { id: string; username: string; deviceId: string } {
  // 模擬自定義 Token 解碼
  return { id: 'user-id-123', username: 'testuser', deviceId: 'device-123' };
}

export default router;
