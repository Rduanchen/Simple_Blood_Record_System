import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface WarningBasis {
  systolic: number;
  diastolic: number;
  pulse: number;
}

export interface SafetyMonitorAttributes {
  id: string;
  userId: string;
  notificationSwitch: boolean;
  warningBasis: WarningBasis;
  dangerBasis: WarningBasis;
  createdAt: Date;
  updatedAt: Date;
}

interface SafetyMonitorCreationAttributes extends Optional<SafetyMonitorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SafetyMonitor extends Model<SafetyMonitorAttributes, SafetyMonitorCreationAttributes> implements SafetyMonitorAttributes {
  public id!: string;
  public userId!: string;
  public notificationSwitch!: boolean;
  public warningBasis!: WarningBasis;
  public dangerBasis!: WarningBasis;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SafetyMonitor.init(
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
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    notificationSwitch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    warningBasis: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        systolic: 140,
        diastolic: 90,
        pulse: 100,
      },
    },
    dangerBasis: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        systolic: 180,
        diastolic: 120,
        pulse: 120,
      },
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
    modelName: 'SafetyMonitor',
    tableName: 'safety_monitors',
    indexes: [
      {
        name: 'safety_monitor_id_index',
        fields: ['id']
      },
      {
        name: 'safety_monitor_user_id_index',
        fields: ['userId']
      }
    ],
  }
);

export default SafetyMonitor;