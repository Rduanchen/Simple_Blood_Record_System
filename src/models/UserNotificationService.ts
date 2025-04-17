import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface UserNotificationServiceAttributes {
  id: string;
  dataOwnerId: string;
  receiverId: string;
  notificationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserNotificationServiceCreationAttributes extends Optional<UserNotificationServiceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserNotificationService
  extends Model<UserNotificationServiceAttributes, UserNotificationServiceCreationAttributes>
  implements UserNotificationServiceAttributes
{
  public id!: string;
  public dataOwnerId!: string;
  public receiverId!: string;
  public notificationId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserNotificationService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dataOwnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    notificationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserNotificationService',
    tableName: 'user_notification_services',
    indexes: [
      {
        name: 'notification_service_id_index',
        fields: ['id'],
      },
      {
        name: 'notification_owner_id_index',
        fields: ['dataOwnerId'],
      },
      {
        name: 'notification_receiver_id_index',
        fields: ['receiverId'],
      },
      {
        name: 'notification_id_index',
        fields: ['notificationId'],
      },
    ],
  },
);

export default UserNotificationService;
