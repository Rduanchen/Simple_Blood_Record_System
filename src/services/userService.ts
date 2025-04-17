import { v4 as uuidv4 } from 'uuid';
import { User } from '../models';
import { UserAttributes } from '../models/User';
import { getFirebaseAuth } from '../config/firebase';
import { createSafetyMonitor } from './safetyMonitorService';
import { SafetyMonitorAttributes } from '../models/SafetyMonitor';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || undefined;

interface JwtPayload {
  id: string;
  name: string;
}

export const createUser = async (email: string, name: string, firebaseUid: string): Promise<UserAttributes> => {
  const user = await User.create({
    id: uuidv4(),
    email,
    name,
    firebaseUid,
  });

  return user.toJSON() as UserAttributes;
};

export const getUserByFirebaseUid = async (firebaseUid: string): Promise<UserAttributes | null> => {
  const user = await User.findOne({
    where: {
      firebaseUid,
    },
  });

  return (user?.toJSON() as UserAttributes) || null;
};

export const getUserById = async (id: string): Promise<UserAttributes | null> => {
  const user = await User.findByPk(id);
  return (user?.toJSON() as UserAttributes) || null;
};

export const updateUserName = async (id: string, name: string): Promise<UserAttributes | null> => {
  const user = await User.findByPk(id);

  if (user === null) {
    return null;
  }

  user.name = name;
  await user.save();

  return user.toJSON() as UserAttributes;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const user = await User.findByPk(id);

  if (user === null) {
    return false;
  }

  await user.destroy();

  return true;
};

export const generateJwtToken = (user: UserAttributes): string => {
  const payload: JwtPayload = {
    id: user.id,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET);
};

export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const loginOrSignUp = async (firebaseToken: string): Promise<{ user: UserAttributes; token: string } | null> => {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(firebaseToken);

    const { uid, email, name } = decodedToken;

    if (email === undefined) {
      return null;
    }

    let user = await getUserByFirebaseUid(uid);

    if (user === null) {
      // New user, sign up
      user = await createUser(email, name || email.split('@')[0], uid);
      // Create warning and danger basis
      const safetyMonitor: SafetyMonitorAttributes = await createSafetyMonitor(user.id);
    }

    const token = generateJwtToken(user);

    return {
      user,
      token,
    };
  } catch (error) {
    return null;
  }
};

export const userIdToName = async (userId: string): Promise<string | null> => {
  const user = await getUserById(userId);
  return user?.name || null;
};
