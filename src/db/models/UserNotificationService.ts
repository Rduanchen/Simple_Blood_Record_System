import { Model, DataTypes, type Sequelize } from 'sequelize';

interface UserNotificationServiceAttributes {
  id: string;
  userId: string;
  notificationId: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserNotificationService extends Model<UserNotificationServiceAttributes> implements UserNotificationServiceAttributes {
  public id!: string;
  public userId!: string;
  public notificationId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initUserNotificationServiceModel = (sequelize: Sequelize): typeof UserNotificationService => {
  UserNotificationService.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
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
      tableName: 'user_notification_services',
      indexes: [
        {
          name: 'uns_user_id_idx',
          fields: ['userId'],
        },
        {
          name: 'uns_notification_id_idx',
          fields: ['notificationId'],
        },
      ],
    },
  );

  return UserNotificationService;
};

export default UserNotificationService;
