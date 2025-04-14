import { User } from '../../db/models';
import { v4 as uuidv4 } from 'uuid';

interface UserData {
  email: string;
  name: string;
  firebaseUid: string;
  lastLoginDate?: Date;
}

interface UserRecord extends UserData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 創建新使用者
 */
export async function createUser(userData: UserData): Promise<UserRecord> {
  const userID = uuidv4();
  const user = await User.create({
    id: userID,
    ...userData,
    lastLoginDate: userData.lastLoginDate ?? new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return user as unknown as UserRecord;
}

/**
 * 刪除使用者
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const user = await User.findByPk(userId);

  if (user == null) {
    return false;
  }

  await user.destroy();
  return true;
}

/**
 * 更新使用者最後登入日期
 */
export async function updateUserLastLogin(userId: string): Promise<UserRecord | null> {
  const user = await User.findByPk(userId);

  if (user == null) {
    return null;
  }

  await user.update({ lastLoginDate: new Date() });
  return user as unknown as UserRecord;
}

/**
 * 更新使用者資料
 */
export async function updateUserData(userId: string, userData: Partial<UserData>): Promise<UserRecord | null> {
  const user = await User.findByPk(userId);

  if (user == null) {
    return null;
  }

  await user.update(userData);
  return user as unknown as UserRecord;
}

/**
 * 根據ID獲取使用者資料
 */
export async function getUserById(userId: string): Promise<UserRecord | null> {
  const user = await User.findByPk(userId);
  return user as unknown as UserRecord | null;
}

/**
 * 根據Firebase UID獲取使用者資料
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<UserRecord | null> {
  const user = await User.findOne({
    where: { firebaseUid },
  });

  return user as unknown as UserRecord | null;
}

/**
 * 根據Email獲取使用者資料
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await User.findOne({
    where: { email },
  });

  return user as unknown as UserRecord | null;
}
