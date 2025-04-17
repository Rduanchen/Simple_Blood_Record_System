import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface BloodPressureAttributes {
  id: string;
  userId: string;
  date: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BloodPressureCreationAttributes extends Optional<BloodPressureAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BloodPressure extends Model<BloodPressureAttributes, BloodPressureCreationAttributes> implements BloodPressureAttributes {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public systolic!: number;
  public diastolic!: number;
  public pulse!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

BloodPressure.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    systolic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 300,
      },
    },
    diastolic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 200,
      },
    },
    pulse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 300,
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
    modelName: 'BloodPressure',
    tableName: 'blood_pressures',
    indexes: [
      {
        name: 'blood_pressure_id_index',
        fields: ['id']
      },
      {
        name: 'blood_pressure_user_id_index',
        fields: ['userId']
      },
      {
        name: 'blood_pressure_date_index',
        fields: ['date']
      },
      {
        name: 'blood_pressure_user_date_index',
        fields: ['userId', 'date']
      }
    ],
  }
);

export default BloodPressure;