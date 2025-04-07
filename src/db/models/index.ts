import { type Sequelize } from 'sequelize';
import User, { initUserModel } from './User';
import UserSettings, { initUserSettingsModel } from './UserSettings';
import BloodPressure, { initBloodPressureModel } from './BloodPressure';
import UserNotificationService, { initUserNotificationServiceModel } from './UserNotificationService';

const setupModels = (sequelize: Sequelize): { User: any; UserSettings: any; BloodPressure: any; UserNotificationService: any } => {
  // 初始化模型
  const User = initUserModel(sequelize);
  const UserSettings = initUserSettingsModel(sequelize);
  const BloodPressure = initBloodPressureModel(sequelize);
  const UserNotificationService = initUserNotificationServiceModel(sequelize);

  // 定義關聯
  User.hasOne(UserSettings, {
    foreignKey: 'userId',
    as: 'settings',
    onDelete: 'CASCADE',
  });
  UserSettings.belongsTo(User, {
    foreignKey: 'userId',
  });

  User.hasMany(BloodPressure, {
    foreignKey: 'userId',
    as: 'bloodPressures',
    onDelete: 'CASCADE',
  });
  BloodPressure.belongsTo(User, {
    foreignKey: 'userId',
  });

  User.hasMany(UserNotificationService, {
    foreignKey: 'userId',
    as: 'notificationServices',
    onDelete: 'CASCADE',
  });
  UserNotificationService.belongsTo(User, {
    foreignKey: 'userId',
  });

  return {
    User,
    UserSettings,
    BloodPressure,
    UserNotificationService,
  };
};

export default setupModels;
export { User, UserSettings, BloodPressure, UserNotificationService };
