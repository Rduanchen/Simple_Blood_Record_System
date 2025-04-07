import { Model, DataTypes, type Sequelize } from 'sequelize';

interface BloodPressureAttributes {
  id: string;
  userId: string;
  date: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
  createdAt: Date;
  updatedAt: Date;
}

class BloodPressure extends Model<BloodPressureAttributes> implements BloodPressureAttributes {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public systolic!: number;
  public diastolic!: number;
  public pulse!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initBloodPressureModel = (sequelize: Sequelize): typeof BloodPressure => {
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
          model: 'users',
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
      },
      diastolic: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pulse: {
        type: DataTypes.INTEGER,
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
      tableName: 'blood_pressures',
      indexes: [
        {
          name: 'bp_user_id_idx',
          fields: ['userId'],
        },
        {
          name: 'bp_date_idx',
          fields: ['date'],
        },
        {
          // 複合索引，優化使用者日期查詢
          name: 'bp_user_id_date_idx',
          fields: ['userId', 'date'],
        },
      ],
    },
  );

  return BloodPressure;
};

export default BloodPressure;
