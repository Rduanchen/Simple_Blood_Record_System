import { Model, DataTypes, type Sequelize } from 'sequelize';

interface UserSettingsAttributes {
  id: string;
  userId: string;
  safeZone: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
    pulse: { min: number; max: number };
  };
  warningBasis: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };
  dangerBasis: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

class UserSettings extends Model<UserSettingsAttributes> implements UserSettingsAttributes {
  public id!: string;
  public userId!: string;
  public safeZone!: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
    pulse: { min: number; max: number };
  };

  public warningBasis!: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };

  public dangerBasis!: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };

  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initUserSettingsModel = (sequelize: Sequelize): typeof UserSettings => {
  UserSettings.init(
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
      safeZone: {
        type: DataTypes.JSONB, // 使用JSONB優化查詢性能
        allowNull: false,
      },
      warningBasis: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      dangerBasis: {
        type: DataTypes.JSONB,
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
      tableName: 'user_settings',
      indexes: [
        {
          name: 'user_settings_user_id_idx',
          fields: ['userId'],
          unique: true, // 使用者只會有一個設定，設為唯一索引
        },
      ],
    },
  );

  return UserSettings;
};

export default UserSettings;
