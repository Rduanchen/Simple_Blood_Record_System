import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays } from 'date-fns';

// Mock ShareCode records
export const validShareCode = {
  id: 'valid-code',
  ownerId: 'owner-1',
  expiresAt: addDays(new Date(), 5),
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON() {
    return { ...this };
  },
  destroy: jest.fn(),
};

export const expiredShareCode = {
  id: 'expired-code',
  ownerId: 'owner-1',
  expiresAt: subDays(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON() {
    return { ...this };
  },
  destroy: jest.fn(),
};

export const shareCodeList = [
  {
    id: 'code-1',
    ownerId: 'owner-1',
    expiresAt: addDays(new Date(), 2),
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON() {
      return { ...this };
    },
  },
  {
    id: 'code-2',
    ownerId: 'owner-1',
    expiresAt: addDays(new Date(), 3),
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON() {
      return { ...this };
    },
  },
];

export const existingAccess = {
  id: 'access-1',
  dataOwnerId: 'owner-1',
  accessableUserId: 'user-2',
};

export const accessConfirmCreated = {
  id: uuidv4(),
  dataOwnerId: 'owner-1',
  accessableUserId: 'user-2',
};