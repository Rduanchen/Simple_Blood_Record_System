import { Model, DataTypes, type Sequelize } from 'sequelize';

interface UserAttributes {
  id: string;
  email: string;
  name: string;
  firebaseUid: string;
  lastLoginDate?: Date; // 添加最後登入日期欄位
  createdAt: Date;
  updatedAt: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string;
  public firebaseUid!: string;
  public lastLoginDate?: Date; // 添加最後登入日期欄位
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firebaseUid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      lastLoginDate: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: 'users',
      indexes: [
        // 主鍵已經自動索引
        {
          name: 'users_firebase_uid_idx',
          fields: ['firebaseUid'],
        },
        {
          name: 'users_email_idx',
          fields: ['email'],
        },
      ],
    },
  );

  return User;
};

export default User;
