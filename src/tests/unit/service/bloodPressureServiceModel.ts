import { v4 as uuidv4 } from 'uuid';

export const generalParameter = {
  userID: 'user1',
  requestID: 'request1',
  offset: 0,
  limit: 10,
  queryStartDate: new Date('2023-01-01T00:00:00Z'),
  queryEndDate: new Date('2023-1-30T23:59:59Z'),
  date: new Date('2023-01-15T10:00:00Z'),
  uuid: uuidv4(),
};

const startIndex = 0;
const endIndex = 1;

export const mockBloodPressureValue = [
  {
    id: '1',
    userId: 'user1',
    date: new Date('2023-01-15T10:00:00Z'),
    systolic: 120,
    diastolic: 80,
    pulse: 70,
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-01-15T10:00:00Z'),
    toJSON: function () {
      return {
        id: this.id,
        userId: this.userId,
        date: this.date,
        systolic: this.systolic,
        diastolic: this.diastolic,
        pulse: this.pulse,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  },
  {
    id: '2',
    userId: 'user1',
    date: new Date('2023-01-20T12:00:00Z'),
    systolic: 130,
    diastolic: 85,
    pulse: 75,
    createdAt: new Date('2023-01-20T12:00:00Z'),
    updatedAt: new Date('2023-01-20T12:00:00Z'),
    toJSON: function () {
      return {
        id: this.id,
        userId: this.userId,
        date: this.date,
        systolic: this.systolic,
        diastolic: this.diastolic,
        pulse: this.pulse,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  },
  {
    id: '3',
    userId: 'user2',
    date: new Date('2023-02-10T08:30:00Z'),
    systolic: 110,
    diastolic: 75,
    pulse: 65,
    createdAt: new Date('2023-02-10T08:30:00Z'),
    updatedAt: new Date('2023-02-10T08:30:00Z'),
    toJSON: function () {
      return {
        id: this.id,
        userId: this.userId,
        date: this.date,
        systolic: this.systolic,
        diastolic: this.diastolic,
        pulse: this.pulse,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  },
  {
    id: '4',
    userId: 'user2',
    date: new Date('2023-02-05T14:45:00Z'),
    systolic: 140,
    diastolic: 90,
    pulse: 80,
    createdAt: new Date('2023-02-05T14:45:00Z'),
    updatedAt: new Date('2023-02-05T14:45:00Z'),
    toJSON: function () {
      return {
        id: this.id,
        userId: this.userId,
        date: this.date,
        systolic: this.systolic,
        diastolic: this.diastolic,
        pulse: this.pulse,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  },
  {
    id: '5',
    userId: 'user3',
    date: new Date('2023-02-18T09:15:00Z'),
    systolic: 125,
    diastolic: 82,
    pulse: 72,
    createdAt: new Date('2023-02-18T09:15:00Z'),
    updatedAt: new Date('2023-02-18T09:15:00Z'),
    toJSON: function () {
      return {
        id: this.id,
        userId: this.userId,
        date: this.date,
        systolic: this.systolic,
        diastolic: this.diastolic,
        pulse: this.pulse,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  },
];

export const expectedBloodPressureValue = [
  {
    id: '1',
    userId: 'user1',
    date: new Date('2023-01-15T10:00:00Z'),
    systolic: 120,
    diastolic: 80,
    pulse: 70,
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-01-15T10:00:00Z'),
  },
  {
    id: '2',
    userId: 'user1',
    date: new Date('2023-01-20T12:00:00Z'),
    systolic: 130,
    diastolic: 85,
    pulse: 75,
    createdAt: new Date('2023-01-20T12:00:00Z'),
    updatedAt: new Date('2023-01-20T12:00:00Z'),
  },
  {
    id: '3',
    userId: 'user2',
    date: new Date('2023-02-10T08:30:00Z'),
    systolic: 110,
    diastolic: 75,
    pulse: 65,
    createdAt: new Date('2023-02-10T08:30:00Z'),
    updatedAt: new Date('2023-02-10T08:30:00Z'),
  },
  {
    id: '4',
    userId: 'user2',
    date: new Date('2023-02-05T14:45:00Z'),
    systolic: 140,
    diastolic: 90,
    pulse: 80,
    createdAt: new Date('2023-02-05T14:45:00Z'),
    updatedAt: new Date('2023-02-05T14:45:00Z'),
  },
  {
    id: '5',
    userId: 'user3',
    date: new Date('2023-02-18T09:15:00Z'),
    systolic: 125,
    diastolic: 82,
    pulse: 72,
    createdAt: new Date('2023-02-18T09:15:00Z'),
    updatedAt: new Date('2023-02-18T09:15:00Z'),
  },
];

export const mockBloodPressureDateRangeValue = mockBloodPressureValue.slice(0, 2);
export const expectedBloodPressureDateRangeValue = expectedBloodPressureValue.slice(0, 2);

export const fakeBloodPressureCreateValue = {
  userID: generalParameter.userID,
  date: generalParameter.date,
  systolic: 120,
  diastolic: 80,
  pulse: 70,
};

export const mockBloodPressureCreateValue = {
  id: '1',
  userID: generalParameter.userID,
  date: generalParameter.date,
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2023-01-15T10:00:00Z'),
  toJSON: function () {
    return {
      id: this.id,
      userId: this.userID,
      date: this.date,
      systolic: this.systolic,
      diastolic: this.diastolic,
      pulse: this.pulse,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

export const expectedBloodPressureCreateValue = {
  id: expect.any(String),
  userId: generalParameter.userID,
  date: generalParameter.date,
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  createdAt: expect.any(Date),
  updatedAt: expect.any(Date),
  toJSON: expect.any(Function),
};
