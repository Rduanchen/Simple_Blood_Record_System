import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface AccessConfirmAttributes {
  id: string;
  dataOwnerId: string;
  accessableUserId: string;
  createdAt: Date;
}

interface AccessConfirmCreationAttributes extends Optional<AccessConfirmAttributes, 'id' | 'createdAt'> {}

class AccessConfirm extends Model<AccessConfirmAttributes, AccessConfirmCreationAttributes> implements AccessConfirmAttributes {
  public id!: string;
  public dataOwnerId!: string;
  public accessableUserId!: string;
  public createdAt!: Date;
}

AccessConfirm.init(
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
    accessableUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AccessConfirm',
    tableName: 'access_confirms',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'access_confirm_id_index',
        fields: ['id']
      },
      {
        name: 'access_owner_id_index',
        fields: ['dataOwnerId']
      },
      {
        name: 'access_user_id_index',
        fields: ['accessableUserId']
      },
      {
        name: 'access_composite_index',
        fields: ['dataOwnerId', 'accessableUserId'],
        unique: true
      }
    ],
  }
);

export default AccessConfirm;