import User from './User';
import BloodPressure from './BloodPressure';
import SafetyMonitor from './SafetyMonitor';
import UserNotificationService from './UserNotificationService';
import ShareCode from './ShareCode';
import AccessConfirm from './AccessConfirm';

// Define associations
User.hasMany(BloodPressure, {
  foreignKey: 'userId',
  as: 'bloodPressures',
});
BloodPressure.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasOne(SafetyMonitor, {
  foreignKey: 'userId',
  as: 'safetyMonitor',
});
SafetyMonitor.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(ShareCode, {
  foreignKey: 'ownerId',
  as: 'shareCodes',
});
ShareCode.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

User.hasMany(UserNotificationService, {
  foreignKey: 'dataOwnerId',
  as: 'notificationServices',
});
UserNotificationService.belongsTo(User, {
  foreignKey: 'dataOwnerId',
  as: 'dataOwner',
});

User.hasMany(UserNotificationService, {
  foreignKey: 'receiverId',
  as: 'receivedNotifications',
});
UserNotificationService.belongsTo(User, {
  foreignKey: 'receiverId',
  as: 'receiver',
});

User.hasMany(AccessConfirm, {
  foreignKey: 'dataOwnerId',
  as: 'sharedAccesses',
});
AccessConfirm.belongsTo(User, {
  foreignKey: 'dataOwnerId',
  as: 'dataOwner',
});

User.hasMany(AccessConfirm, {
  foreignKey: 'accessableUserId',
  as: 'accessPermissions',
});
AccessConfirm.belongsTo(User, {
  foreignKey: 'accessableUserId',
  as: 'accessableUser',
});

export {
  User,
  BloodPressure,
  SafetyMonitor,
  UserNotificationService,
  ShareCode,
  AccessConfirm,
};